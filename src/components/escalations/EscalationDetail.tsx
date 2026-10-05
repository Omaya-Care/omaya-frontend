import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, FileText, Phone, PhoneOff } from "lucide-react";
import { toast } from "@/lib/notify";
import { api, extractApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useCall, type CallDetailData } from "@/hooks/useCall";
import type { AlertRow } from "@/hooks/useAlerts";
import { Centered, DetailSkeleton, FlagReasons, Transcript } from "@/components/calls/CallDetail";
import { CHANNEL_LABEL, formatDuration } from "@/components/calls/call-display";
import { formatDateTime, initials, severityClass } from "@/components/mothers/mother-display";
import { onSessionReset } from "@/lib/auth-api";
import { usePermissions } from "@/hooks/usePermissions";
import { trackAlertViewed } from "@/lib/analytics";
import { formatTimeLeft, isUnreached, timeLeftClass } from "./alert-display";

// Unsent resolution notes, per alert id, for this tab's session only — so a
// note survives the transcript view, an Acknowledge (the alert leaves the
// Open list) and switching to another alert. In memory, never localStorage:
// the note is PHI. Wiped when a new session starts.
const noteDrafts = new Map<string, string>();
onSessionReset(() => noteDrafts.clear());

function saveDraft(alertId: string, note: string) {
  if (note.trim()) noteDrafts.set(alertId, note);
  else noteDrafts.delete(alertId);
}

const STATUS_CLASS: Record<string, string> = {
  open: "bg-red-50 text-red-600",
  acknowledged: "bg-amber-50 text-amber-700",
  resolved: "bg-green-50 text-green-700",
};

/** Right-hand panel of /escalations: who + the clock, key fields, why the
 *  alert fired beside the call's facts, actions pinned in the footer. */
export function EscalationDetail({ alert, onChanged }: { alert: AlertRow | null; onChanged: () => void }) {
  const { data: call, loading, failed } = useCall(alert?.callId ?? null);
  const [view, setView] = useState<"details" | "transcript">("details");
  // Owned here, not by <Actions>, which unmounts while the transcript is open.
  // The parent keys this component by alert id, so the initial read is per alert.
  const [note, setNoteState] = useState(() => (alert ? (noteDrafts.get(alert.id) ?? "") : ""));
  const setNote = (next: string) => {
    setNoteState(next);
    if (alert) saveDraft(alert.id, next);
  };
  // Tracking plan KPI 8: a clinician opened this alert.
  const alertId = alert?.id;
  useEffect(() => {
    if (alertId) trackAlertViewed(alertId);
  }, [alertId]);

  if (!alert) {
    return (
      <Centered>
        <span
          aria-hidden="true"
          className="block size-[106px] bg-gray-300 [mask:url(/icons/warning-arrows.svg)_center/contain_no-repeat]"
        />
        <p className="-mt-2 text-sm text-gray-400">Select an escalation to view its details</p>
      </Centered>
    );
  }
  if (loading) return <DetailSkeleton />;
  if (view === "transcript" && call) return <Transcript call={call} onBack={() => setView("details")} />;

  return (
    <div className="flex min-h-0 flex-1 flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out motion-reduce:animate-none">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <EscalationHeader alert={alert} call={call} />

        <Banners alert={alert} />
        <Handled alert={alert} />

        {failed || !call ? (
          <p className="mt-2 text-sm text-gray-400">Couldn't load the call behind this escalation.</p>
        ) : (
          <CallSections call={call} onOpenTranscript={() => setView("transcript")} />
        )}
      </div>

      <Actions alert={alert} onChanged={onChanged} note={note} setNote={setNote} />
    </div>
  );
}

/** Header: who + the clock. */
function EscalationHeader({ alert, call }: { alert: AlertRow; call: CallDetailData | null }) {
  return (
    <header className="flex items-center gap-4 pb-6">
      <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#7A2850]/10 text-xl text-[#7A2850]">
        {initials(alert.motherName)}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h2 className="truncate text-2xl font-normal tracking-tight text-gray-900">{alert.motherName}</h2>
        <span className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${severityClass(alert.severity)}`}
          >
            {alert.provisionalReason === "post_call_failed" ? "Needs review" : alert.severity}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_CLASS[alert.status] ?? ""}`}
          >
            {alert.status}
          </span>
          {call && <CallTime call={call} />}
        </span>
      </div>
      {alert.status === "open" && (
        <div className="shrink-0 text-right">
          <p className="text-sm text-gray-500">Response due</p>
          <p className={`text-xl tabular-nums ${timeLeftClass(alert.timeLeftMinutes)}`}>
            {formatTimeLeft(alert.timeLeftMinutes)}
          </p>
        </div>
      )}
    </header>
  );
}

function CallTime({ call }: { call: CallDetailData }) {
  if (!call.startedAt && !call.scheduledAt) return null;
  return (
    <span className="flex items-center gap-1 text-sm text-gray-500">
      <Clock className="size-3.5 text-[#7A2850]" />
      {/* started_at is when it connected; scheduled_at may be the planned slot. */}
      {call.startedAt
        ? `Call came in ${formatDateTime(call.startedAt)}`
        : `Scheduled for ${formatDateTime(call.scheduledAt)}`}
    </span>
  );
}

/** The call as a full-width table, then why it fired + the summary. */
function CallSections({ call, onOpenTranscript }: { call: CallDetailData; onOpenTranscript: () => void }) {
  return (
    <>
      <section className="mt-2">
        <p className="flex items-center gap-1.5 text-sm text-gray-500">
          <Phone className="size-3.5 text-[#7A2850]" />
          Call
        </p>
        <div className="mt-2 overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-2.5 text-left font-normal">Direction</th>
                <th className="px-5 py-2.5 text-left font-normal">Channel</th>
                <th className="px-5 py-2.5 text-left font-normal">Type</th>
                <th className="px-5 py-2.5 text-left font-normal">Duration</th>
              </tr>
            </thead>
            <tbody className="font-medium text-gray-900">
              <tr className="border-t border-gray-200">
                <td className="truncate px-5 py-3.5">{call.direction === "inbound" ? "Incoming" : "Outgoing"}</td>
                <td className="truncate px-5 py-3.5">{CHANNEL_LABEL[call.channel] ?? "Call"}</td>
                <td className="truncate px-5 py-3.5">{call.callType || "—"}</td>
                <td className="truncate px-5 py-3.5">{formatDuration(call.durationSeconds)}</td>
              </tr>
            </tbody>
          </table>
          {call.transcript.length > 0 && (
            <button
              type="button"
              onClick={onOpenTranscript}
              className="w-full border-t border-gray-200 px-5 py-3 text-left text-sm text-[#7A2850] transition-colors hover:text-[#5c1e3c]"
            >
              {call.audioUrl ? "Recording & transcript" : "Transcript"} →
            </button>
          )}
        </div>
      </section>

      {/* ── Why + summary ── */}
      <section className="mt-8 flex flex-col gap-6">
        {call.flagReasons.length > 0 && <FlagReasons reasons={call.flagReasons} />}
        <Summary call={call} empty={call.flagReasons.length === 0} />
      </section>
    </>
  );
}

function Banners({ alert }: { alert: AlertRow }) {
  const banners: ReactNode[] = [];
  if (alert.status === "open" && isUnreached(alert)) {
    banners.push(
      <div key="unreached" role="alert" className="flex items-start gap-3 rounded-2xl bg-red-50 px-5 py-3.5 text-sm text-red-700">
        <PhoneOff className="mt-0.5 size-4 shrink-0" />
        <span>
          <span className="font-medium">On-call staff have not been reached.</span> Contact the on-call clinician
          directly.
        </span>
      </div>,
    );
  }
  if (alert.provisionalReason === "post_call_failed") {
    banners.push(
      <div key="review" className="rounded-2xl bg-amber-50 px-5 py-3.5 text-sm text-amber-800">
        <span className="font-medium">Needs review — severity unknown.</span> This call couldn't be classified
        automatically. Read the transcript and decide.
      </div>,
    );
  }
  if (alert.provisionalReason === "crisis") {
    banners.push(
      <div key="crisis" className="rounded-2xl bg-red-50 px-5 py-3.5 text-sm text-red-700">
        <span className="font-medium">Crisis recognised during the call.</span> Full classification is still pending.
      </div>,
    );
  }
  return banners.length ? <div className="mb-6 flex flex-col gap-3">{banners}</div> : null;
}

/** Who acted on the alert, when, and the note they left — the Acknowledged /
 *  Resolved tabs are only useful if they say this. */
function Handled({ alert }: { alert: AlertRow }) {
  if (!alert.acknowledgedAt && !alert.resolvedAt) return null;
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 px-5 py-3.5 text-sm">
      <ul className="flex flex-col gap-1.5">
        {alert.acknowledgedAt && (
          <li className="flex items-center gap-2 text-gray-600">
            <CheckCircle2 className="size-4 shrink-0 text-amber-600" />
            Acknowledged by <span className="font-medium text-gray-900">{alert.acknowledgedByName ?? "a clinician"}</span>
            <span className="text-gray-400">· {formatDateTime(alert.acknowledgedAt)}</span>
          </li>
        )}
        {alert.resolvedAt && (
          <li className="flex items-center gap-2 text-gray-600">
            <CheckCircle2 className="size-4 shrink-0 text-green-600" />
            Resolved by <span className="font-medium text-gray-900">{alert.resolvedByName ?? "a clinician"}</span>
            <span className="text-gray-400">· {formatDateTime(alert.resolvedAt)}</span>
          </li>
        )}
      </ul>
      {alert.resolutionNote && (
        <p className="mt-2.5 border-t border-gray-100 pt-2.5 leading-relaxed text-gray-900">
          <span className="text-gray-500">Note: </span>
          {alert.resolutionNote}
        </p>
      )}
    </div>
  );
}

function Summary({ call, empty }: { call: CallDetailData; empty: boolean }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-sm text-gray-500">
        <FileText className="size-3.5 text-[#7A2850]" />
        {empty ? "What happened" : "Summary"}
      </p>
      <p className={`mt-1 text-sm leading-relaxed ${call.summary ? "text-gray-900" : "text-gray-400"}`}>
        {call.summary ||
          (empty
            ? "No danger signs or summary were recorded for this call. Check the transcript before acting."
            : "No summary for this call.")}
      </p>
    </div>
  );
}

/** Pinned footer: profile link, resolution note, Acknowledge / Resolve. */
function Actions({
  alert,
  onChanged,
  note,
  setNote,
}: {
  alert: AlertRow;
  onChanged: () => void;
  note: string;
  setNote: (note: string) => void;
}) {
  const [busy, setBusy] = useState<"ack" | "resolve" | null>(null);
  const { can } = usePermissions();

  if (alert.status === "resolved") return null;
  if (alert.provisionalReason) {
    return (
      <footer className="mt-6 shrink-0 border-t border-gray-100 pt-4 text-xs text-gray-500">
        Actions unlock once the call finishes classifying — it will then appear here as a full escalation.
      </footer>
    );
  }

  async function act(kind: "ack" | "resolve") {
    setBusy(kind);
    try {
      if (kind === "ack") {
        await api.post(`/alerts/${alert.id}/acknowledge`);
        toast.success("Escalation acknowledged.");
      } else {
        await api.post(`/alerts/${alert.id}/resolve`, note.trim() ? { resolution_note: note.trim() } : undefined);
        noteDrafts.delete(alert.id);
        toast.success("Escalation resolved.");
      }
      onChanged();
    } catch (err) {
      if (extractApiError(err).status === 409) {
        // Someone else resolved it first — a retry can never succeed.
        toast.info("This escalation was already resolved by someone else.");
        // Not discarded: the clinician may still want what they typed.
        onChanged();
      } else {
        toast.error(kind === "ack" ? "Could not acknowledge. Please try again." : "Could not resolve. Please try again.");
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <footer className="mt-6 flex shrink-0 items-center gap-3 border-t border-gray-100 pt-4">
      {/* The profile lives on /mothers, which needs `view_mothers`. */}
      {can("view_mothers") && (
        <Link
          to={`/mothers?mother=${encodeURIComponent(alert.motherId)}`}
          className="shrink-0 text-sm text-[#7A2850] transition-colors hover:text-[#5c1e3c]"
        >
          View profile
        </Link>
      )}
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={500}
        placeholder="What was done? (optional, saved on resolve)"
        aria-label="Resolution note"
        className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#7A2850]"
      />
      {alert.status === "open" && (
        <Button variant="outline" disabled={busy !== null} onClick={() => act("ack")}>
          {busy === "ack" ? "Acknowledging…" : "Acknowledge"}
        </Button>
      )}
      <Button disabled={busy !== null} onClick={() => act("resolve")}>
        {busy === "resolve" ? "Resolving…" : "Resolve"}
      </Button>
    </footer>
  );
}
