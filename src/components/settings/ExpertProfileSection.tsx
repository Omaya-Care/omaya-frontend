import { Input } from '../ui/Input';
import { Textarea } from '../ui/textarea';
import type { Me, UpdateMeInput } from '../../hooks/useMe';
import { extractApiError } from '../../lib/api';
import { EXPERT_HOSPITAL_NAME } from '../../lib/auth';
import { toast } from '../../lib/notify';
import { Section, SaveChangesButton } from './SettingsPrimitives';
import { useAccountDraft } from './useAccountDraft';

interface ExpertProfileSectionProps {
  me: Me | null;
  isLoading: boolean;
  isUpdating: boolean;
  updateMe: (input: UpdateMeInput) => Promise<unknown>;
}

interface ExpertDraft {
  bio: string;
  yearsOfExperience: string;
  specialty: string;
  languages: string;
}

const EMPTY_EXPERT_DRAFT: ExpertDraft = { bio: '', yearsOfExperience: '', specialty: '', languages: '' };

function seedExpertDraft(me: Me): ExpertDraft {
  return {
    bio: me.bio ?? '',
    yearsOfExperience: me.yearsOfExperience != null ? String(me.yearsOfExperience) : '',
    specialty: me.specialty ?? '',
    languages: me.languages.join(', '),
  };
}

/* ─── Pure derivations over the draft vs. the saved account ───── */
function parseYears(yearsOfExperience: string): { parsedYears: number | null; yearsValid: boolean } {
  const trimmedYears = yearsOfExperience.trim();
  const parsedYears = trimmedYears === '' ? null : Number(trimmedYears);
  const yearsValid = trimmedYears === '' || (Number.isInteger(parsedYears) && parsedYears! >= 0 && parsedYears! <= 80);
  return { parsedYears, yearsValid };
}

function parseLanguages(languages: string): string[] {
  return languages
    .split(',')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function deriveExpertProfile(draft: ExpertDraft, me: Me | null) {
  const { parsedYears, yearsValid } = parseYears(draft.yearsOfExperience);
  const parsedLanguages = parseLanguages(draft.languages);
  const languagesChanged =
    parsedLanguages.join("\u0000") !== (me?.languages ?? []).join("\u0000");
  const expertProfileChanged =
    draft.bio.trim() !== (me?.bio ?? '').trim() ||
    parsedYears !== (me?.yearsOfExperience ?? null) ||
    draft.specialty.trim() !== (me?.specialty ?? '').trim() ||
    languagesChanged;
  return { parsedYears, yearsValid, parsedLanguages, expertProfileChanged };
}

/* ─── Expert form state ───────────────────────────────────────── */
function useExpertProfileForm({ me, isLoading, isUpdating, updateMe }: ExpertProfileSectionProps) {
  const [draft, setField] = useAccountDraft(me, seedExpertDraft, EMPTY_EXPERT_DRAFT);
  const { bio, yearsOfExperience, specialty, languages } = draft;

  const { parsedYears, yearsValid, parsedLanguages, expertProfileChanged } = deriveExpertProfile(draft, me);
  const canSaveExpertProfile =
    expertProfileChanged && yearsValid && !isUpdating && !isLoading;

  const handleSaveExpertProfile = async () => {
    if (!canSaveExpertProfile) return;
    // Never fall back to the email: that would save her login address as her
    // display name. With no name on file, leave `name` out entirely.
    const name = (me?.name ?? '').trim();
    try {
      await updateMe({
        ...(name ? { name } : {}),
        bio: bio.trim() || null,
        years_of_experience: parsedYears,
        specialty: specialty.trim() || null,
        languages: parsedLanguages,
      });
      toast.success('Expert profile updated.');
    } catch (err) {
      toast.error(extractApiError(err, 'Failed to save your expert profile.').message);
    }
  };

  return {
    bio, setBio: (v: string) => setField('bio', v),
    yearsOfExperience, setYearsOfExperience: (v: string) => setField('yearsOfExperience', v),
    specialty, setSpecialty: (v: string) => setField('specialty', v),
    languages, setLanguages: (v: string) => setField('languages', v),
    yearsValid,
    canSaveExpertProfile,
    handleSaveExpertProfile,
  };
}

/* ─── Expert profile (OMA-341, expert-roster accounts only) ───── */
// What a mother sees on the consent card before she agrees to talk. Separate
// save action from the name field in "Your profile" (different section,
// different "changed" gate). The form state lives here, but this component
// stays mounted for every account so the draft survives the same renders it
// did when the state lived on the page; it only renders for expert accounts.
export const ExpertProfileSection = (props: ExpertProfileSectionProps) => {
  const { me, isLoading, isUpdating } = props;
  const form = useExpertProfileForm(props);

  const isExpertAccount = me?.hospitalName === EXPERT_HOSPITAL_NAME;
  if (isLoading || !isExpertAccount) return null;

  return (
    <Section
      heading="My expert profile"
      subtitle="What a mother sees when you claim her request, before she agrees to talk."
    >
      <div className="flex flex-col gap-4">
        <Textarea
          label="Short bio"
          value={form.bio}
          onChange={(e) => form.setBio(e.target.value)}
          placeholder="A sentence or two about how you help mothers."
          rows={3}
          maxLength={2000}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Years of experience"
            type="number"
            min={0}
            max={80}
            value={form.yearsOfExperience}
            onChange={(e) => form.setYearsOfExperience(e.target.value)}
          />
          <Input
            label="Specialty / focus"
            value={form.specialty}
            onChange={(e) => form.setSpecialty(e.target.value)}
            placeholder="e.g. Postpartum depression"
            maxLength={200}
            fullWidth
          />
        </div>
        {!form.yearsValid && (
          <p className="text-xs text-red-500 -mt-2">Enter a whole number between 0 and 80.</p>
        )}
        <Input
          label="Languages spoken"
          value={form.languages}
          onChange={(e) => form.setLanguages(e.target.value)}
          placeholder="e.g. English, Twi, Ga"
          fullWidth
        />
        <p className="text-xs text-gray-400 -mt-3">
          Separate languages with commas. Shown in the portal only, not to mothers.
        </p>
      </div>
      <SaveChangesButton
        onClick={form.handleSaveExpertProfile}
        disabled={!form.canSaveExpertProfile}
        isSaving={isUpdating}
      />
    </Section>
  );
};
