import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Loader2, Pause, Play } from "lucide-react";

function fmt(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Audio player with a brand-coloured waveform. WaveSurfer fetches the audio to
 * draw it; if that fails (e.g. no CORS on the S3 URL) we fall back to native
 * <audio> so playback still works.
 */
export function WaveformPlayer({ src, className }: { src: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  // Reset during render (not in the effect) so a stale frame never commits.
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
      waveColor: "#E9C9DA",
      progressColor: "#7A2850",
      cursorColor: "#7A2850",
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
        /* already torn down */
      }
      wsRef.current = null;
    };
  }, [src]);

  if (failed) {
    return (
      <audio
        controls
        src={src}
        preload="none"
        aria-label="Call recording audio player"
        className={`h-8 w-full ${className ?? ""}`}
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
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#7A2850] text-white transition-colors hover:bg-[#5c1e3c] disabled:opacity-50"
      >
        {!isReady ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="size-3.5" />
        ) : (
          <Play className="ml-0.5 size-3.5" />
        )}
      </button>
      <div ref={containerRef} className="min-w-0 flex-1" />
      <span className="w-[68px] shrink-0 text-right text-xs tabular-nums text-gray-500">
        {fmt(current)} / {fmt(duration)}
      </span>
    </div>
  );
}
