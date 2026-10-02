import { Lock } from 'lucide-react';
import { Input } from '../ui/Input';
import { Skeleton } from '../ui/skeleton';
import type { Me, UpdateMeInput } from '../../hooks/useMe';
import { toast } from '../../lib/notify';
import { Section, SaveChangesButton } from './SettingsPrimitives';
import { useAccountDraft } from './useAccountDraft';

/* ─── Profile skeleton ────────────────────────────────────────── */
const ProfileSkeleton = () => (
  <>
    <div className="flex items-center gap-4 mb-6">
      <Skeleton className="w-14 h-14 rounded-full flex-shrink-0" />
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3.5 w-52" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  </>
);

/* ─── Initials helper ─────────────────────────────────────────── */
function initials(nameOrEmail: string): string {
  const parts = nameOrEmail.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0][0] ?? '?').toUpperCase();
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
}

interface ProfileSectionProps {
  me: Me | null;
  isLoading: boolean;
  isUpdating: boolean;
  updateMe: (input: UpdateMeInput) => Promise<unknown>;
}

/* ─── Name form state ─────────────────────────────────────────── */
const EMPTY_NAME = { name: '' };
const seedName = (me: Me) => ({ name: me.name ?? '' });

function useProfileNameForm({ me, isLoading, isUpdating, updateMe }: ProfileSectionProps) {
  const [{ name }, setField] = useAccountDraft(me, seedName, EMPTY_NAME);
  const setName = (value: string) => setField('name', value);

  const nameChanged = name.trim() !== (me?.name ?? '').trim() && name.trim() !== '';
  const canSave = nameChanged && !isUpdating && !isLoading;

  const handleSave = async () => {
    if (!nameChanged) return;
    try {
      await updateMe(name.trim());
      toast.success('Profile updated.');
    } catch {
      toast.error('Failed to save changes. Please try again.');
    }
  };

  return { name, setName, canSave, handleSave };
}

/* ─── Identity header (avatar + name + role/hospital) ─────────── */
const ProfileIdentity = ({ me }: { me: Me | null }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="w-14 h-14 rounded-full bg-[#7A2850]/10 text-[#7A2850] font-medium text-lg flex items-center justify-center flex-shrink-0 select-none">
      {initials(me?.name || me?.email || '?')}
    </div>
    <div>
      <p className="font-semibold text-gray-900">{me?.name || me?.email}</p>
      <p className="text-sm text-gray-400">
        {me?.role} · {me?.hospitalName}
      </p>
    </div>
  </div>
);

/* ─── Read-only account fields ────────────────────────────────── */
const AccountFields = ({ me }: { me: Me | null }) => (
  <>
    <Input
      label="Work email"
      type="email"
      value={me?.email ?? ''}
      disabled
      rightIcon={<Lock size={14} className="text-gray-300" />}
      fullWidth
    />

    <Input
      label="Role"
      value={me?.role ?? ''}
      disabled
      fullWidth
    />

    <Input
      label="Hospital"
      value={me?.hospitalName ?? ''}
      disabled
      fullWidth
    />
  </>
);

/* ─── Section 1: Your profile ─────────────────────────────────── */
export const ProfileSection = (props: ProfileSectionProps) => {
  const { me, isLoading, isUpdating } = props;
  const { name, setName, canSave, handleSave } = useProfileNameForm(props);

  return (
    <Section
      heading="Your profile"
      subtitle="Your account details and how you sign in."
    >
      {isLoading ? (
        <ProfileSkeleton />
      ) : (
        <>
          <ProfileIdentity me={me} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />

            <AccountFields me={me} />

            <p className="col-span-2 text-xs text-gray-400 -mt-1">
              Roles and hospital are managed by your administrator.
            </p>
          </div>

          <SaveChangesButton onClick={handleSave} disabled={!canSave} isSaving={isUpdating} />
        </>
      )}
    </Section>
  );
};
