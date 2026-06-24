import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause, Loader2 } from "lucide-react";

interface WaveformPlayerProps {
  src: string;
  className?: string;
}

/** Resolve a theme HSL CSS variable to a concrete `hsl(...)` string.
 * Canvas (which WaveSurfer draws into) can't resolve `var(--x)`, so we read
 * the computed value and wrap it. Falls back to the brand pink if absent. */
function cssHsl(varName: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v ? `hsl(${v})` : fallback;
}

function fmt(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Audio player with a brand-coloured waveform (wavesurfer.js).
 *
 * WaveSurfer fetches the audio to decode + draw the waveform; if that fails
 * (e.g. the audio host doesn't send CORS headers — relevant for S3 presigned
 * URLs), we degrade to a native <audio> element so playback still works. */
export function WaveformPlayer({ src, className }: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  // Reset player state when the source changes — done DURING render (the React
  // way) rather than in the effect. Resetting inside the effect committed a
  // frame of stale UI (old waveform/time) before the reset landed; the inline
  // `prev`-prop comparison re-renders immediately with no intermediate commit.
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setIsReady(false);
    setFailed(false);
    setIsPlaying(false);
    setCurrent(0);
    setDuration(0);
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ws = WaveSurfer.create({
      container: el,
      height: 28,
      waveColor: cssHsl("--primary-200", "hsl(328 42% 86%)"),
      progressColor: cssHsl("--primary", "hsl(330 38% 41%)"),
      cursorColor: cssHsl("--primary", "hsl(330 38% 41%)"),
      cursorWidth: 1,
      barWidth: 2,
      barGap: 1.5,
      barRadius: 2,
      normalize: true,
      url: src,
    });
    wsRef.current = ws;

    ws.on("ready", () => {
      setIsReady(true);
      setDuration(ws.getDuration());
    });
    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => setIsPlaying(false));
    ws.on("timeupdate", (t: number) => setCurrent(t));
    ws.on("error", () => setFailed(true));

    return () => {
      try {
        ws.destroy();
      } catch {
        /* instance already torn down */
      }
      wsRef.current = null;
    };
  }, [src]);

  // Waveform decode failed (most likely CORS) — fall back to native playback.
  if (failed) {
    return (
      <audio
        controls
        src={src}
        preload="none"
        aria-label="Call recording audio player"
        className={`w-full h-8 ${className ?? ""}`}
      />
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => wsRef.current?.playPause()}
        disabled={!isReady}
        aria-label={isPlaying ? "Pause recording" : "Play recording"}
        className="shrink-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-50"
      >
        {!isReady ? (
          <Loader2 size={13} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={13} />
        ) : (
          <Play size={13} className="ml-0.5" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div ref={containerRef} className="w-full" />
      </div>
      <span className="shrink-0 text-[11px] text-gray-500 tabular-nums w-[68px] text-right">
        {fmt(current)} / {fmt(duration)}
      </span>
    </div>
  );
}
