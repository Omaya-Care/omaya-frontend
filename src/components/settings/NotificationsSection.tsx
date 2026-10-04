import { useAlertSoundEnabled } from '../../hooks/useAlertSound';
import { useEscalationSound } from '../../hooks/useEscalationSound';
import { setAlertSoundEnabled } from '../../lib/alert-prefs';
import { Section, Toggle } from './SettingsPrimitives';

/* ─── Notification row ────────────────────────────────────────── */
const NotifRow = ({
  label,
  description,
  enabled,
  onToggle,
  locked = false,
  last = false,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle?: () => void;
  locked?: boolean;
  last?: boolean;
}) => (
  <div className={`flex items-center justify-between py-4 ${last ? '' : 'border-b border-gray-200'}`}>
    <div className="pr-8">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-400 mt-0.5">{description}</p>
    </div>
    <Toggle enabled={enabled} onChange={onToggle} locked={locked} label={label} />
  </div>
);

/* ─── Locked (not-yet-configurable) preferences ───────────────── */
// No placeholder toggles for things nothing sends (elevated-alert, daily-summary
// and weekly-report notifications) — a switch that does nothing misleads.
const LOCKED_PREFERENCES: ReadonlyArray<{ label: string; description: string; enabled: boolean }> = [
  {
    label: 'Crisis alerts (L4)',
    description: 'Always on. A mother in crisis needs an immediate response.',
    enabled: true,
  },
  {
    label: 'Missed check-ins',
    description: 'When a scheduled call goes unanswered.',
    enabled: false,
  },
];

/* ─── Alert-sound preference ──────────────────────────────────── */
function useAlertSoundPreference() {
  // In-app escalation alert sound — persisted per-browser in localStorage. This
  // chime is the de-facto real-time notifier, so it defaults ON; muting is an
  // explicit opt-out. Muting only silences the chime — OS notifications (when
  // permitted) still fire so a muted tab isn't left with no signal.
  // Read from the shared store, so this toggle and the notifications panel's
  // stay in sync (same tab and across tabs).
  const alertSound = useAlertSoundEnabled();
  // `unlock` resumes the shared AudioContext + requests OS-notification permission,
  // but only works inside a user gesture. Passing `undefined` means this hook
  // instance never chimes itself — we only want `unlock`.
  const { unlock } = useEscalationSound(undefined);

  const toggleAlertSound = () => {
    const next = !alertSound;
    setAlertSoundEnabled(next);
    // Turning sound ON is the moment to cross the browser autoplay gate and ask
    // for notification permission — this click is the required gesture. No-op when
    // disabling; harmless if permission is already granted/denied.
    if (next) unlock();
  };

  return { alertSound, toggleAlertSound };
}

/* ─── Section 3: Notifications ────────────────────────────────── */
export const NotificationsSection = () => {
  const { alertSound, toggleAlertSound } = useAlertSoundPreference();

  return (
    <Section
      heading="Notifications"
      subtitle="Crisis and elevated alerts are always active. More preferences are coming soon."
    >
      <NotifRow
        label="Alert sound"
        // Discloses the SECOND channel this toggle turns on. Enabling calls
        // `unlock()`, which also requests OS-notification permission — and a
        // desktop notification can surface an escalation outside the portal
        // (lock screen, shared clinic machine). Muting silences only the
        // chime, by design, so that asymmetry has to be stated too.
        description="Play a chime in this browser when a new escalation arrives. Also asks permission to show desktop notifications — those keep appearing even when the chime is muted."
        enabled={alertSound}
        onToggle={toggleAlertSound}
      />
      {LOCKED_PREFERENCES.map((pref, i) => (
        <NotifRow
          key={pref.label}
          label={pref.label}
          description={pref.description}
          enabled={pref.enabled}
          locked
          last={i === LOCKED_PREFERENCES.length - 1}
        />
      ))}
      <p className="text-xs text-gray-400 pt-2">
        Notification preferences will be configurable in a future update.
      </p>
    </Section>
  );
};
