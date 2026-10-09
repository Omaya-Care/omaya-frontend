import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ClipboardList,
  Clock,
  MessageCircle,
  Pencil,
  PhoneCall,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import {
  MEDICATION_OPTIONS,
  PREGNANCY_RISKS,
  PRE_EXISTING_RISKS,
} from "@/components/onboarding/discharge/discharge-form";
import { RISK_OPTIONS } from "@/components/onboarding/add-mother/add-mother-form";
import { usePermissions } from "@/hooks/usePermissions";
import { CALL_NOW_ENABLED } from "@/lib/env";
import { CallNowMenu } from "./CallNowMenu";
import { EditMotherDialog } from "./EditMotherDialog";
import { LogVisitModal } from "./LogVisitModal";
import { WithdrawModal } from "./WithdrawModal";
import { useMother, type MotherProfile } from "@/hooks/useMother";
import {
  formatDate,
  formatDateTime,
  humanize,
  initials,
  severityClass,
} from "./mother-display";

const CONSENT_CLASS: Record<string, string> = {
  active: "bg-[#F7E8F0] text-[#7A2850]",
  withdrawn: "bg-red-50 text-red-600",
  pending: "bg-yellow-50 text-yellow-700",
};

const CALL_WINDOW: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  inbound: "Inbound",
};

type Tab = "details" | "checkins";

/** Right-hand profile panel of the Mothers page. */
export function MotherDetail({
  motherId,
  onWithdrawn,
  onUpdated,
}: {
  motherId: string | null;
  /** Called after a withdrawal so the list can move her to the Withdrawn tab. */
  onWithdrawn: () => void;
  /** Called after an edit so the list picks up a changed phone etc. */
  onUpdated?: () => void;
}) {
  const { data, loading, failed, reload } = useMother(motherId);

  if (!motherId) {
    return (
      <Centered>
        {/* Masked so the single-colour SVG takes our palette, like the sidebar logo. */}
        <span
          aria-hidden="true"
          className="mb-3 block h-20 w-16 bg-gray-300 [mask:url(/brand/mother-baby-icon.svg)_center/contain_no-repeat]"
        />
        <p className="text-sm text-gray-400">Select a mother to view her profile</p>
      </Centered>
    );
  }
  if (loading) return <DetailSkeleton />;
  if (failed || !data) {
    return (
      <Centered>
        <p className="text-sm text-gray-400">Couldn't load this mother's profile.</p>
      </Centered>
    );
  }
  // key: reset the tab when switching mothers.
  return (
    <Profile
      key={data.id}
      mother={data}
      reload={reload}
      onUpdated={() => {
        reload();
        onUpdated?.();
      }}
      onWithdrawn={() => {
        reload();
        onWithdrawn();
      }}
    />
  );
}

const PROFILE_TABS = [
  { value: "details", label: "Details" },
  { value: "checkins", label: "Check-ins" },
] as const;

function Profile({
  mother,
  reload,
  onUpdated,
  onWithdrawn,
}: {
  mother: MotherProfile;
  reload: () => void;
  onUpdated: () => void;
  onWithdrawn: () => void;
}) {
  const [tab, setTab] = useState<Tab>("details");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [logVisitOpen, setLogVisitOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { can } = usePermissions();
  const canMessage = can("message_mothers");
  const isWithdrawn = mother.consentStatus === "withdrawn";

  // Profile is keyed by mother id, so this entrance replays on every switch.
  return (
    <div className="flex min-h-0 flex-1 flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out motion-reduce:animate-none">
    <div className="min-h-0 flex-1 overflow-y-auto">
      <ProfileHeader
        mother={mother}
        canEdit={canMessage && !isWithdrawn}
        isWithdrawn={isWithdrawn}
        onEdit={() => setEditOpen(true)}
      />
      <KeyStats mother={mother} />

      {mother.currentFlag && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <p className="text-sm leading-snug text-amber-700">{mother.currentFlag}</p>
        </div>
      )}

      {/* ── Tabs ── */}
      <SegmentedTabs tabs={PROFILE_TABS} value={tab} onChange={setTab} className="mt-6 w-fit" />

      <div className="py-6">
        {tab === "details" ? <DetailsTab mother={mother} /> : <CheckInsTab mother={mother} />}
      </div>
    </div>

      <ProfileActions
        mother={mother}
        canMessage={canMessage}
        isWithdrawn={isWithdrawn}
        onWithdraw={() => setWithdrawOpen(true)}
        onLogVisit={() => setLogVisitOpen(true)}
        reload={reload}
      />

      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onWithdrawn={onWithdrawn}
        motherId={mother.id}
        motherName={mother.name}
      />
      {editOpen && (
        <EditMotherDialog mother={mother} onClose={() => setEditOpen(false)} onSaved={onUpdated} />
      )}
      <LogVisitModal
        open={logVisitOpen}
        onClose={() => setLogVisitOpen(false)}
        onLogged={reload}
        motherId={mother.id}
        motherName={mother.name}
        dayPostpartum={mother.dayPostpartum}
      />
    </div>
  );
}

function ProfileHeader({
  mother,
  canEdit,
  isWithdrawn,
  onEdit,
}: {
  mother: MotherProfile;
  canEdit: boolean;
  isWithdrawn: boolean;
  onEdit: () => void;
}) {
  return (
    <header className="flex items-center gap-4 pb-6">
      <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#7A2850]/10 text-xl text-[#7A2850]">
        {initials(mother.name)}
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <h2 className="truncate text-2xl font-normal tracking-tight text-gray-900">
          {mother.name}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {mother.severity && (
            <span
              className={`rounded-full px-2 py-px text-[11px] font-medium capitalize ${severityClass(mother.severity)}`}
            >
              {mother.severity}
            </span>
          )}
          {mother.hospital && <span className="text-xs text-gray-500">{mother.hospital}</span>}
        </div>
        {isWithdrawn && (
          <p className="text-xs text-red-500">Record is read-only. Consent has been withdrawn.</p>
        )}
      </div>
      {/* PATCH /mothers/{id} has no backend permission dependency; gated on
          `message_mothers` like the production portal. Hidden on a withdrawn
          (read-only) record. */}
      {canEdit && (
        <Button variant="outline" size="sm" onClick={onEdit} className="ml-auto self-start">
          <Pencil />
          Edit
        </Button>
      )}
      <InfoTip className={canEdit ? "self-start" : "ml-auto self-start"}>
        Severity labels are system-set and read-only for audit integrity.
      </InfoTip>
    </header>
  );
}

/** Key stats (same layout as call details). */
function KeyStats({ mother }: { mother: MotherProfile }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
      <Stat icon={<Clock className="size-3.5 text-[#7A2850]" />} label="Postpartum">
        {mother.dayPostpartum != null ? `Day ${mother.dayPostpartum}` : "—"}
      </Stat>
      <Stat icon={<ShieldCheck className="size-3.5 text-[#7A2850]" />} label="Consent">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${CONSENT_CLASS[mother.consentStatus] ?? "bg-gray-100 text-gray-500"}`}
        >
          {mother.consentStatus || "—"}
        </span>
      </Stat>
      <Stat icon={<MessageCircle className="size-3.5 text-[#7A2850]" />} label="Last call">
        {mother.lastInteraction ? formatDateTime(mother.lastInteraction) : "None"}
      </Stat>
      <Stat icon={<PhoneCall className="size-3.5 text-[#7A2850]" />} label="Check-ins">
        {mother.checkIns.length}
      </Stat>
    </dl>
  );
}

/** Pinned footer: withdraw, log visit, call now. */
function ProfileActions({
  mother,
  canMessage,
  isWithdrawn,
  onWithdraw,
  onLogVisit,
  reload,
}: {
  mother: MotherProfile;
  canMessage: boolean;
  isWithdrawn: boolean;
  onWithdraw: () => void;
  onLogVisit: () => void;
  reload: () => void;
}) {
  return (
    <footer className="flex shrink-0 items-center justify-between border-t border-gray-100 pt-4">
      {/* Withdrawing needs `message_mothers` — hidden rather than offered and 403'd. */}
      {isWithdrawn || !canMessage ? (
        <span />
      ) : (
        <button
          type="button"
          onClick={onWithdraw}
          title="This will stop all scheduled calls for this mother."
          className="flex items-center gap-1.5 text-xs text-red-500 transition-colors hover:text-red-700"
        >
          <XCircle className="size-4" />
          Withdraw from program
        </button>
      )}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onLogVisit}
          disabled={!canMessage}
          title={canMessage ? "Record a manual visit or note." : "You don't have permission to log visits"}
        >
          <ClipboardList />
          Log visit
        </Button>
        {CALL_NOW_ENABLED && canMessage && (
          <CallNowMenu mother={mother} disabled={isWithdrawn} onChanged={reload} />
        )}
      </div>
    </footer>
  );
}

/** Icon-only hint; the text shows on hover or keyboard focus. */
function InfoTip({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span className={`group relative ${className ?? ""}`}>
      <button
        type="button"
        aria-label="About severity labels"
        className="flex size-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-black/[0.04] hover:text-gray-600"
      >
        <ShieldCheck className="size-4" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute top-full right-0 z-20 mt-1 w-56 rounded-lg bg-gray-900 px-3 py-2 text-xs leading-snug text-white opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        {children}
      </span>
    </span>
  );
}

function DetailsTab({ mother }: { mother: MotherProfile }) {
  return (
    <div className="flex flex-col gap-4">
      <Section title="Contact">
        <Fields
          rows={[
            ["Phone", mother.phone],
            ["Call window", CALL_WINDOW[mother.preferredCallWindow] ?? mother.preferredCallWindow],
            ["Language", mother.language && humanize(mother.language)],
            ["Date of birth", formatDate(mother.dateOfBirth)],
          ]}
        />
        {mother.emergencyContacts.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-3">
            <p className="text-sm text-gray-500">Emergency contacts</p>
            <ul className="mt-1.5 flex flex-col gap-1.5">
              {mother.emergencyContacts.map((c, i) => (
                <li key={`${c.name}:${c.phone}`} className="text-sm text-gray-900">
                  <span className="font-medium">{c.name || "—"}</span>
                  {c.relationship && (
                    <span className="capitalize text-gray-500">
                      {" "}· {c.relationship}
                      {i === 0 && mother.emergencyContacts.length > 1 ? " (primary)" : ""}
                    </span>
                  )}
                  <span className="text-gray-500"> · </span>
                  {c.phone || "—"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <Section title="Clinical">
        <Fields
          rows={[
            ["Delivery", mother.deliveryType && humanize(mother.deliveryType)],
            [
              "Gravida / Para",
              mother.gravida != null && mother.para != null ? `G${mother.gravida} P${mother.para}` : "",
            ],
            ["Delivered", formatDate(mother.deliveryDate)],
            ["Discharged", formatDate(mother.dischargeDate)],
          ]}
        />
        <div className="grid grid-cols-2 border-t border-gray-200 px-4 py-2.5">
          <div className="pr-6">
            <p className="text-sm text-gray-500">Risk factors</p>
            <Chips
              items={mother.risks}
              empty="None recorded"
              className="border-amber-200 bg-amber-50 text-amber-700"
            />
          </div>
          <div className="pr-6">
            <p className="text-sm text-gray-500">Medications</p>
            <Chips items={mother.medications} empty="None recorded" className="border-gray-200 bg-white text-gray-600" />
          </div>
        </div>
      </Section>
    </div>
  );
}

function CheckInsTab({ mother }: { mother: MotherProfile }) {
  if (mother.checkIns.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10">
        <PhoneCall className="size-8 text-gray-200" />
        <p className="text-sm text-gray-400">No check-ins recorded yet.</p>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-gray-100">
      {mother.checkIns.map((c) => (
        <li key={c.id} className="py-4 first:pt-0">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-gray-900">{formatDate(c.date)}</span>
              {c.day != null && <span className="text-xs text-gray-400">· Day {c.day}</span>}
            </span>
            {c.severity && (
              <span
                className={`rounded-full px-2 py-px text-[11px] font-medium capitalize ${severityClass(c.severity)}`}
              >
                {c.severity}
              </span>
            )}
          </div>
          <p className="text-sm leading-snug text-gray-600">{c.summary}</p>
        </li>
      ))}
    </ul>
  );
}

function Stat({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)]">
      <h3 className="border-b border-gray-200 px-4 py-2.5 text-base font-medium text-gray-900">{title}</h3>
      {children}
    </section>
  );
}

/** Label-above-value grid; empty values are left out. */
function Fields({ rows }: { rows: [string, string][] }) {
  const filled = rows.filter(([, value]) => value);
  if (filled.length === 0) return <p className="px-4 py-3 text-sm text-gray-400">Nothing recorded</p>;
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 px-4 py-3">
      {filled.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-sm text-gray-500">{label}</dt>
          <dd className="truncate text-sm font-medium text-gray-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

// Enum codes the wizards write; anything else is a free-text "Other" entry
// and is shown exactly as typed.
const KNOWN_CHIP_CODES = new Set(
  [...MEDICATION_OPTIONS, ...PRE_EXISTING_RISKS, ...PREGNANCY_RISKS, ...RISK_OPTIONS].map((o) => o.value),
);

function Chips({ items, empty, className }: { items: string[]; empty: string; className: string }) {
  if (items.length === 0) return <p className="mt-0.5 text-sm text-gray-400">{empty}</p>;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {items.map((it) => (
        <span key={it} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>
          {KNOWN_CHIP_CODES.has(it) ? humanize(it) : it}
        </span>
      ))}
    </div>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 flex-col items-center justify-center">{children}</div>;
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-150 motion-reduce:animate-none">
      <div className="flex items-center gap-4">
        <div className="size-16 animate-pulse rounded-full bg-gray-100" />
        <div className="flex flex-col gap-2">
          <div className="h-6 w-48 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-11 animate-pulse rounded bg-gray-100" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-xl bg-gray-100" />
    </div>
  );
}
