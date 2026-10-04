import { useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useMe } from '../hooks/useMe';
import { Section } from '../components/settings/SettingsPrimitives';
import { MustChangePasswordBanner } from '../components/settings/MustChangePasswordBanner';
import { ProfileSection } from '../components/settings/ProfileSection';
import { ExpertProfileSection } from '../components/settings/ExpertProfileSection';
import { ChangePasswordSection } from '../components/settings/ChangePasswordSection';
import { NotificationsSection } from '../components/settings/NotificationsSection';

/* ─── Notifications deep-link scroll ──────────────────────────── */
// Deep-link from the notifications bell's alert-sound link
// (/settings?section=notifications) — scroll the Notifications section into
// view so the toggle is on screen on arrival. Gated on `!isLoading`: `useMe`
// resolves after mount and reflows the page (profile fields + the
// must-change-password banner), so scrolling before data settles lands in the
// wrong spot — the cause of the "doesn't work every time". Waiting for load,
// then deferring one frame for layout, makes it reliable. Mirrors the password
// section's scroll options.
function useNotificationsDeepLink(isLoading: boolean) {
  const [params] = useSearchParams();
  // `location.key` changes on EVERY navigation — including navigating to the same
  // URL — so keying the scroll effect on it re-drives the scroll even when the
  // clinician is already on /settings?section=notifications and clicks the link
  // again (the search params alone wouldn't change, so the effect wouldn't re-run).
  const location = useLocation();
  const notificationsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.get('section') !== 'notifications' || isLoading) return;
    const raf = requestAnimationFrame(() =>
      notificationsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
    return () => cancelAnimationFrame(raf);
  }, [params, location.key, isLoading]);

  return notificationsSectionRef;
}

/* ─── Page ────────────────────────────────────────────────────── */
const SettingsPage = () => {
  const { me, isLoading, updateMe, isUpdating, changePassword, isChangingPassword } = useMe();
  const passwordSectionRef = useRef<HTMLDivElement>(null);
  const notificationsSectionRef = useNotificationsDeepLink(isLoading);
  const profileProps = { me, isLoading, isUpdating, updateMe };

  return (
    <div className="px-8 py-10 sm:px-12 sm:py-14 lg:px-20 lg:py-16">
      <header>
        <h1 className="text-2xl font-normal tracking-tight text-foreground">Settings</h1>
      </header>

      <div className="mt-10 flex flex-col gap-4">

        {!isLoading && me?.mustChangePassword && (
          <MustChangePasswordBanner
            onChangeNow={() =>
              passwordSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          />
        )}

        <ProfileSection {...profileProps} />

        {/* Renders only for expert-roster accounts once loaded (OMA-341). */}
        <ExpertProfileSection {...profileProps} />

        {/* ── Section 2: Change password ───────────────────────── */}
        <div ref={passwordSectionRef}>
          <Section
            heading="Change password"
            subtitle="Choose a strong password. It must be at least 10 characters with one letter and one digit."
          >
            <ChangePasswordSection changePassword={changePassword} isPending={isChangingPassword} />
          </Section>
        </div>

        <div ref={notificationsSectionRef}>
          <NotificationsSection />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
