import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { clearMustChange, getClinician, setSession } from "@/lib/auth";
import { fetchMe, invalidateMe } from "@/lib/auth-api";
import { refreshPermissions } from "@/hooks/usePermissions";

export interface Me {
  id: string;
  name: string | null;
  email: string;
  role: string;
  hospitalId: string;
  hospitalName: string;
  /** Hospital main / front-desk number (E.164), if the backend sent one. */
  hospitalPhone: string | null;
  mustChangePassword: boolean;
  bio: string | null;
  yearsOfExperience: number | null;
  languages: string[];
  specialty: string | null;
}

export type UpdateMeInput =
  | string
  | {
      /** Omitted to leave her name as it is. */
      name?: string;
      bio?: string | null;
      years_of_experience?: number | null;
      languages?: string[] | null;
      specialty?: string | null;
    };

function toMe(raw: Record<string, unknown>): Me {
  return {
    id: raw.id as string,
    name: (raw.name as string | null) ?? null,
    email: raw.email as string,
    role: raw.role as string,
    hospitalId: raw.hospital_id as string,
    hospitalName: raw.hospital_name as string,
    hospitalPhone: (raw.hospital_phone as string | null) ?? null,
    mustChangePassword: (raw.must_change_password as boolean) ?? false,
    bio: (raw.bio as string | null) ?? null,
    yearsOfExperience: (raw.years_of_experience as number | null) ?? null,
    languages: (raw.languages as string[] | null) ?? [],
    specialty: (raw.specialty as string | null) ?? null,
  };
}

/** Current account from GET /auth/me, plus the profile/password mutations. */
export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const refetch = useCallback(async () => {
    setMe(toMe(await fetchMe(true)));
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then((data) => {
        if (!cancelled) setMe(toMe(data));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Omitted keys (vs. an explicit null) leave the backend's value untouched;
  // a plain string sends exactly `{name}`.
  const updateMe = useCallback(async (input: UpdateMeInput) => {
    setIsUpdating(true);
    try {
      const body = typeof input === "string" ? { name: input } : input;
      const res = await api.patch("/auth/me", body);
      // The shared /auth/me now describes the old profile.
      invalidateMe();
      const next = toMe(res.data);
      setMe(next);
      // Keep the stored clinician name in sync so the layout reflects it.
      const stored = getClinician();
      if (stored) setSession({ ...stored, name: next.name }, next.mustChangePassword);
      return next;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const changePassword = useCallback(
    async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      setIsChangingPassword(true);
      try {
        await api.post("/auth/change-password", {
          current_password: currentPassword,
          new_password: newPassword,
        });
        // The backend re-set the session cookie with must_change_password
        // cleared; just clear the client-side flag.
        clearMustChange();
        await refetch().catch(() => {});
        // The re-issued session carries the role's current permissions.
        void refreshPermissions();
      } finally {
        setIsChangingPassword(false);
      }
    },
    [refetch],
  );

  return { me, isLoading, updateMe, isUpdating, changePassword, isChangingPassword };
}
