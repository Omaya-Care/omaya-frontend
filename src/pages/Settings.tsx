import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '../components/ui/Button';

/* ─── Toggle ─────────────────────────────────────────────────── */
interface ToggleProps {
  enabled: boolean;
  onChange?: () => void;
  locked?: boolean;
}

const Toggle = ({ enabled, onChange, locked = false }: ToggleProps) => (
  <button
    role="switch"
    type="button"
    aria-checked={enabled}
    onClick={locked ? undefined : onChange}
    className={`
      relative inline-flex w-11 h-6 rounded-full flex-shrink-0
      transition-all duration-200 ease-in-out
      ${enabled ? 'bg-[#93406B]' : 'bg-gray-200'}
      ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    <span
      className={`
        absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm
        transition-all duration-200 ease-in-out
        ${enabled ? 'translate-x-5' : 'translate-x-0.5'}
      `}
    />
  </button>
);

/* ─── Section shell ───────────────────────────────────────────── */
const Section = ({
  heading,
  subtitle,
  children,
}: {
  heading: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3">
    <div>
      <h2 className="text-xl font-semibold text-gray-900">{heading}</h2>
      <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 p-6">{children}</div>
  </div>
);

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
  <div className={`flex items-center justify-between py-4 ${last ? '' : 'border-b border-gray-100'}`}>
    <div className="pr-8">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-400 mt-0.5">{description}</p>
    </div>
    <Toggle enabled={enabled} onChange={onToggle} locked={locked} />
  </div>
);

/* ─── Page ────────────────────────────────────────────────────── */
const SettingsPage = () => {
  /* Profile */
  const [profileName, setProfileName] = useState('Kwame Boateng');
  const [profileEmail, setProfileEmail] = useState('k.boateng@korlebu.gov.gh');

  /* Clinic */
  const [clinicName, setClinicName] = useState('Korle Bu Teaching Hospital');
  const [clinicUnit, setClinicUnit] = useState('Maternity');
  const [clinicCity, setClinicCity] = useState('Accra, Ghana');
  const [supportPhone, setSupportPhone] = useState('0302 674 002');

  /* Notifications */
  const [elevatedAlerts, setElevatedAlerts] = useState(true);
  const [missedCheckIns, setMissedCheckIns] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);

  /* Save feedback */
  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    /* Outer scroll container — fills AppShell's flex-1 main area */
    <div className="h-full overflow-y-auto">
      <div className="w-full flex flex-col gap-10 pb-10">

        {/* Page title */}
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

        {/* ── Section 1: Your profile ─────────────────────────── */}
        <Section
          heading="Your profile"
          subtitle="Your account details and how you sign in."
        >
          {/* Avatar row */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-[#93406B] text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
              KB
            </div>
            <div>
              <p className="font-semibold text-gray-900">Kwame Boateng</p>
              <p className="text-sm text-gray-400">Administrator · Korle Bu Maternity</p>
            </div>
          </div>

          {/* Form grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full name"
              value={profileName}
              onChange={e => setProfileName(e.target.value)}
              fullWidth
            />

            <Input
              label="Work email"
              type="email"
              value={profileEmail}
              onChange={e => setProfileEmail(e.target.value)}
              rightIcon={<Info size={15} />}
              fullWidth
            />

            {/* Role — read-only */}
            <Input
              label="Role"
              value="Administrator"
              disabled
              className="cursor-not-allowed"
              fullWidth
            />

            {/* Change password — aligns to bottom of the Role cell */}
            <div className="flex flex-col justify-end">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 w-full"
              >
                Change password
              </Button>
            </div>

            {/* Helper spans both columns */}
            <p className="col-span-2 text-xs text-gray-400">
              Roles are set by an administrator in Staff & roles.
            </p>
          </div>
        </Section>

        {/* ── Section 2: Clinic profile ───────────────────────── */}
        <Section
          heading="Clinic profile"
          subtitle="Details for Korle Bu Maternity. These appear on exports and in messages to mothers."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Clinic name"
              value={clinicName}
              onChange={e => setClinicName(e.target.value)}
              fullWidth
            />
            <Input
              label="Unit"
              value={clinicUnit}
              onChange={e => setClinicUnit(e.target.value)}
              fullWidth
            />
            <Input
              label="City"
              value={clinicCity}
              onChange={e => setClinicCity(e.target.value)}
              fullWidth
            />
            <Input
              label="Support phone"
              value={supportPhone}
              onChange={e => setSupportPhone(e.target.value)}
              fullWidth
            />
          </div>
        </Section>

        {/* ── Section 3: Notifications ────────────────────────── */}
        <Section
          heading="Notifications"
          subtitle="Choose what you're alerted about. Crisis alerts cannot be turned off."
        >
          <NotifRow
            label="Crisis alerts (L4)"
            description="Always on. A mother in crisis needs an immediate response."
            enabled={true}
            locked={true}
          />
          <NotifRow
            label="Elevated alerts (L3)"
            description="When a mother's check-in is flagged as elevated."
            enabled={elevatedAlerts}
            onToggle={() => setElevatedAlerts(v => !v)}
          />
          <NotifRow
            label="Missed check-ins"
            description="When a scheduled call goes unanswered."
            enabled={missedCheckIns}
            onToggle={() => setMissedCheckIns(v => !v)}
          />
          <NotifRow
            label="Daily summary email"
            description="A morning digest of your cohort."
            enabled={dailySummary}
            onToggle={() => setDailySummary(v => !v)}
          />
          <NotifRow
            label="Weekly report"
            description="Cohort trends and resolved escalations, every Monday."
            enabled={weeklyReport}
            onToggle={() => setWeeklyReport(v => !v)}
            last
          />
        </Section>

        {/* ── Save button ─────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 -mt-4">
          {saved && (
            <span className="text-sm text-green-600 font-medium transition-opacity">
              Changes saved
            </span>
          )}
          <Button variant="default" onClick={handleSave} className="px-6 py-2.5">
            Save changes
          </Button>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
