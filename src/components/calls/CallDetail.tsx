import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  AudioLines,
  Clock,
  FileText,
  ScrollText,
  TriangleAlert,
  Timer,
  UserRound,
} from "lucide-react";
import { useCall, type CallDetailData } from "@/hooks/useCall";
import { WaveformPlayer } from "@/components/ui/WaveformPlayer";
import { useMother } from "@/hooks/useMother";
import { CHANNEL_LABEL, formatDuration } from "./call-display";
import { CALL_NOW_ENABLED } from "@/lib/env";
import { usePermissions } from "@/hooks/usePermissions";
import { trackConversationOpened } from "@/lib/analytics";
import { CallNowMenu } from "@/components/mothers/CallNowMenu";
import { formatDateTime, humanize, initials, severityClass } from "@/components/mothers/mother-display";

const STATUS: Record<string, { label: string; className: string }> = {
  completed: { label: "Completed", className: "bg-green-50 text-green-700" },
  in_progress: { label: "In progress", className: "bg-sky-50 text-sky-700" },
  upcoming: { label: "Scheduled", className: "bg-amber-50 text-amber-700" },
  missed: { label: "Missed", className: "bg-red-50 text-red-600" },
};


/** Right-hand panel of the Calls page: the selected call's details. */
export function CallDetail({ callId }: { callId: string | null }) {
  const { data, loading, failed } = useCall(callId);

  if (!callId) {
    return (
      <Centered>
        {/* Masked so the single-colour SVG takes our palette. */}
        <span
          aria-hidden="true"
          className="block size-20 bg-gray-300 [mask:url(/icons/phone-chat.svg)_center/contain_no-repeat]"
        />
        <p className="mt-3 text-sm text-gray-400">Select a call to view its details</p>
      </Centered>
    );
  }
  if (loading) return <DetailSkeleton />;
  if (failed || !data) {
    return (
      <Centered>
        <p className="text-sm text-gray-400">Couldn't load this call.</p>
      </Centered>
    );
  }
  return <Details key={data.id} call={data} />;
}

const UNKNOWN_STATUS_CLASS = "bg-gray-100 text-gray-500";

const EMPTY_SUMMARY: Record<string, string> = {
  upcoming: "This call hasn't happened yet.",
  missed: "No answer — the call was not connected.",
};

function statusFor(status: string): { label: string; className: string } {
  return STATUS[status] ?? { label: humanize(status), className: UNKNOWN_STATUS_CLASS };
}

/** Whether the call actually connected (vs. scheduled / missed). */
function callHappened(call: CallDetailData): boolean {
  return call.status === "completed" || call.status === "in_progress";
}

function Details({ call }: { call: CallDetailData }) {
  const [view, setView] = useState<"details" | "transcript">("details");
  // Fetched here (not in the footer) so it survives the transcript toggle.
  const mother = useMother(call.motherId);

  if (view === "transcript") {
    return <Transcript call={call} onBack={() => setView("details")} />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out motion-reduce:animate-none">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <DetailsHeader call={call} />

        {/* ── Why it was flagged ── */}
        {call.flagReasons.length > 0 && <FlagReasons reasons={call.flagReasons} />}

        <KeyFields call={call} />
        <OutcomeCard call={call} />
        <SummarySection call={call} onOpenTranscript={() => setView("transcript")} />
      </div>

      <DetailsFooter call={call} mother={mother} />
    </div>
  );
}

function DetailsHeader({ call }: { call: CallDetailData }) {
  const status = statusFor(call.status);
  return (
    <header className="flex items-center gap-4 pb-6">
      <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#7A2850]/10 text-xl text-[#7A2850]">
        {initials(call.motherName)}
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <h2 className="truncate text-2xl font-normal tracking-tight text-gray-900">{call.motherName}</h2>
        <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
          {status.label}
        </span>
      </div>
    </header>
  );
}

function KeyFields({ call }: { call: CallDetailData }) {
  const inbound = call.direction === "inbound";
  const Arrow = inbound ? ArrowDownLeft : ArrowUpRight;
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
      <Field icon={<Arrow className="size-3.5 text-[#7A2850]" />} label={inbound ? "Incoming" : "Outgoing"}>
        {CHANNEL_LABEL[call.channel] ?? "Call"}
      </Field>
      <Field icon={<UserRound className="size-3.5 text-[#7A2850]" />} label="Type">
        {call.callType || "—"}
      </Field>
      {/* The real connect time when the backend has one; otherwise the plan. */}
      <Field icon={<Clock className="size-3.5 text-[#7A2850]" />} label={call.startedAt ? "Started" : "Scheduled"}>
        {formatDateTime(call.startedAt || call.scheduledAt) || "—"}
      </Field>
      <Field icon={<Timer className="size-3.5 text-[#7A2850]" />} label="Duration">
        {formatDuration(call.durationSeconds)}
      </Field>
    </dl>
  );
}

function SeverityPill({ severity }: { severity: CallDetailData["severity"] }) {
  if (!severity) return <span className="text-gray-400">—</span>;
  return (
    <span className={`rounded-full px-2 py-px text-[11px] font-medium capitalize ${severityClass(severity)}`}>
      {severity}
    </span>
  );
}

function OutcomeCard({ call }: { call: CallDetailData }) {
  return (
    <div className="mt-6 divide-y divide-gray-200 rounded-2xl border border-gray-200">
      <Row label="Severity">
        <SeverityPill severity={call.severity} />
      </Row>
      <Row label="Flags raised">{callHappened(call) ? call.flagsRaised : "—"}</Row>
      <Row label="Day in care">{call.dayInCare != null ? `Day ${call.dayInCare}` : "—"}</Row>
      <Row label="Delivery">{call.deliveryType ? humanize(call.deliveryType) : "—"}</Row>
      {call.endReason && <Row label="Ended">{humanize(call.endReason)}</Row>}
    </div>
  );
}

function SummarySection({ call, onOpenTranscript }: { call: CallDetailData; onOpenTranscript: () => void }) {
  const hasAudio = Boolean(call.audioUrl);
  return (
    <div className="mt-6 flex items-start justify-between gap-6">
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm text-gray-500">
          <FileText className="size-3.5 text-[#7A2850]" />
          Summary
        </p>
        <p className="mt-1 text-sm leading-relaxed text-gray-900">
          {call.summary || (EMPTY_SUMMARY[call.status] ?? "No summary for this call.")}
        </p>
      </div>
      {call.transcript.length > 0 && (
        <button
          type="button"
          onClick={onOpenTranscript}
          className="flex shrink-0 items-center gap-1.5 text-sm text-[#7A2850] transition-colors hover:text-[#5c1e3c]"
        >
          {hasAudio ? <AudioLines className="size-3.5" /> : <ScrollText className="size-3.5" />}
          {hasAudio ? "Recording & full transcript" : "Full transcript"}
        </button>
      )}
    </div>
  );
}

/** Pinned footer: profile link + Call now. */
function DetailsFooter({ call, mother }: { call: CallDetailData; mother: ReturnType<typeof useMother> }) {
  // Placing a call needs message_mothers; without it the menu would only 403.
  const canMessage = usePermissions().can("message_mothers");
  return (
    <footer className="mt-6 flex shrink-0 items-center justify-between border-t border-gray-100 pt-4">
      <Link
        to={`/mothers?mother=${encodeURIComponent(call.motherId)}`}
        className="text-sm text-[#7A2850] transition-colors hover:text-[#5c1e3c]"
      >
        View mother's profile
      </Link>
      {CALL_NOW_ENABLED && canMessage && mother.data && (
        <CallNowMenu
          mother={mother.data}
          disabled={mother.data.consentStatus === "withdrawn"}
          onChanged={mother.reload}
        />
      )}
    </footer>
  );
}

export function FlagReasons({ reasons }: { reasons: CallDetailData["flagReasons"] }) {
  return (
    <div className="mb-6">
      <p className="flex items-center gap-1.5 text-sm text-gray-500">
        <TriangleAlert className="size-3.5 text-[#7A2850]" />
        Why this was flagged
      </p>
      <ul className="mt-2 divide-y divide-gray-200 rounded-2xl border border-gray-200">
        {reasons.map((r, i) => (
          <li key={`${r.signal}-${i}`} className="flex items-start justify-between gap-4 px-5 py-3.5 text-sm">
            <span className="text-gray-900">
              {r.description}
              {r.severity && <span className="text-gray-500"> · reported {r.severity}</span>}
            </span>
            <span
              className={`shrink-0 rounded-full px-2 py-px text-[11px] font-medium capitalize ${
                r.tier ? severityClass(r.tier) : "bg-gray-100 text-gray-500"
              }`}
            >
              {r.tier ?? "Review"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Transcript({ call, onBack }: { call: CallDetailData; onBack: () => void }) {
  const firstName = call.motherName.split(" ")[0] || "Mother";
  // Tracking plan KPI 8: a clinician opened a transcript.
  useEffect(() => trackConversationOpened(call.id), [call.id]);
  return (
    <div className="flex min-h-0 flex-1 flex-col animate-in fade-in slide-in-from-right-2 duration-200 motion-reduce:animate-none">
      <header className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to call details"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-black/[0.04] hover:text-gray-900"
        >
          <ArrowLeft className="size-[18px]" />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-base font-medium text-gray-900">{call.motherName}</h2>
          <p className="text-xs text-gray-400">{call.callType} · transcript</p>
        </div>
      </header>

      {call.audioUrl ? (
        <RecordingSection>
          <WaveformPlayer key={call.id} src={call.audioUrl} />
        </RecordingSection>
      ) : call.recordingConsent === false ? (
        // Say so explicitly, so a missing player isn't mistaken for a broken one.
        <RecordingSection>
          <p className="text-sm text-gray-500">
            Not recorded — this mother did not consent to call recording. The transcript below is unaffected.
          </p>
        </RecordingSection>
      ) : null}

      <ol className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto pb-2">
        {call.transcript.map((t, i, arr) => {
          const omaya = t.speaker === "omaya";
          // Name + avatar only on the first turn of a same-speaker run.
          const startsGroup = i === 0 || arr[i - 1].speaker !== t.speaker;
          return (
            // Append-only transcript — never reordered or filtered.
            // react-doctor-disable-next-line react-doctor/no-array-index-as-key
            <li
              key={i}
              className={`flex flex-col ${startsGroup ? "mt-5 first:mt-0" : "mt-1"} ${omaya ? "items-start" : "items-end"}`}
            >
              {startsGroup && (
                <span className={`mb-1 flex items-center gap-1.5 px-0.5 ${omaya ? "" : "flex-row-reverse"}`}>
                  <span
                    className={`flex size-5 items-center justify-center rounded-full text-[9px] font-medium ${
                      omaya ? "bg-[#7A2850] text-white" : "bg-[#7A2850]/10 text-[#7A2850]"
                    }`}
                  >
                    {omaya ? "O" : firstName.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">{omaya ? "Omaya" : firstName}</span>
                </span>
              )}
              <p
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  omaya
                    ? `bg-gray-100 text-gray-900 ${startsGroup ? "rounded-tl-md" : ""}`
                    : `bg-[#F7E8F0] text-[#5c1e3c] ${startsGroup ? "rounded-tr-md" : ""}`
                }`}
              >
                {t.text}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function RecordingSection({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 border-b border-gray-100 pt-4 pb-5">
      <p className="pb-2 text-sm text-gray-500">Recording</p>
      {children}
    </div>
  );
}

function Field({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="flex items-center gap-1.5 text-sm text-gray-500">
        {icon}
        {label}
      </dt>
      <dd className="truncate text-base text-gray-900">{children}</dd>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{children}</span>
    </div>
  );
}

export function Centered({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 flex-col items-center justify-center">{children}</div>;
}

export function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-150 motion-reduce:animate-none">
      <div className="h-7 w-56 animate-pulse rounded bg-gray-100" />
      <div className="grid grid-cols-2 gap-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-11 animate-pulse rounded bg-gray-100" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}
