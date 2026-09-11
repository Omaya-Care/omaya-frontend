import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { StaffRole, RolePermissions, Me } from "../types";
import { getClinician, setSession, clearMustChange } from "../lib/auth";
import { toMe } from "./useMe";
import { toMother } from "./useMothers";

/**
 * Hook to acknowledge an escalation/alert.
 * Uses POST /alerts/{alert_id}/acknowledge from the API.
 */
export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const response = await api.post(`/alerts/${alertId}/acknowledge`);
      return response.data;
    },
    onSuccess: () => {
      // Refresh escalations list after acknowledgment
      queryClient.invalidateQueries({ queryKey: ["escalations"] });
    },
  });
};

/**
 * Hook to trigger an ad-hoc check-in call on either transport.
 * Uses POST /mothers/{mother_id}/calls from the API; `route` picks the
 * transport ("phone" = Twilio, "whatsapp" = WhatsApp call). Same call, same
 * pipeline — the backend 409s (`whatsapp_unavailable`) rather than silently
 * falling back to phone.
 */
export type CallRoute = "phone" | "whatsapp";

export const useTriggerCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ motherId, route = "phone" }: { motherId: string; route?: CallRoute }) => {
      const response = await api.post(`/mothers/${motherId}/calls`, { route });
      return response.data;
    },
    onSuccess: (_data, { motherId }) => {
      queryClient.invalidateQueries({ queryKey: ["calls"] });
      queryClient.invalidateQueries({ queryKey: ["mother", motherId] });
    },
  });
};

export const useLogVisit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      motherId,
      clinicalObservation,
      medicationAdvice,
      nextAction,
    }: {
      motherId: string;
      clinicalObservation: string;
      medicationAdvice: string;
      nextAction: string;
    }) => {
      const response = await api.post(`/mothers/${motherId}/visits`, {
        clinical_observation: clinicalObservation,
        medication_advice: medicationAdvice,
        next_action: nextAction,
      });
      return response.data;
    },
    onSuccess: (_data, { motherId }) => {
      queryClient.invalidateQueries({ queryKey: ["mother", motherId] });
    },
  });
};

export const useUpdateMother = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ motherId, data }: { motherId: string; data: Record<string, unknown> }) => {
      const response = await api.patch(`/mothers/${motherId}`, data);
      return response.data as Record<string, unknown>;
    },
    onSuccess: (data, { motherId }) => {
      // Use the returned full profile to update the detail cache immediately (no extra refetch)
      queryClient.setQueryData(["mother", motherId], toMother(data));
      // Invalidate the list so name/phone/severity changes reflect there too
      queryClient.invalidateQueries({ queryKey: ["mothers"] });
    },
  });
};

export const useWithdrawMother = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ motherId, reason }: { motherId: string; reason: string }) => {
      const response = await api.post(`/mothers/${motherId}/withdraw`, {
        reason,
        send_confirmation_sms: true,
      });
      return response.data;
    },
    onSuccess: (_data, { motherId }) => {
      queryClient.invalidateQueries({ queryKey: ["mothers"] });
      queryClient.invalidateQueries({ queryKey: ["mother", motherId] });
    },
  });
};

export const useAddStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; email: string; role: StaffRole }) => {
      const res = await api.post("/admin/clinicians", data);
      return res.data as { clinician_id: string; email: string; invite_sent: boolean; role: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};

export const useUpdateClinician = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      clinicianId,
      ...body
    }: {
      clinicianId: string;
      name?: string;
      role?: StaffRole;
      status?: "active" | "suspended";
    }) => {
      const res = await api.patch(`/admin/clinicians/${clinicianId}`, body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};

export const useDeleteClinician = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clinicianId: string) => {
      await api.delete(`/admin/clinicians/${clinicianId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};

export const useAddRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      permissions: RolePermissions;
    }) => {
      const res = await api.post("/admin/roles", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roleId: string) => {
      await api.delete(`/admin/roles/${roleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      input:
        | string
        | {
            name: string;
            bio?: string | null;
            years_of_experience?: number | null;
            languages?: string[] | null;
            specialty?: string | null;
          },
    ) => {
      // bio/years_of_experience/languages/specialty are OMA-341 additions —
      // omitted keys (not sent at all, vs. an explicit null) leave the
      // backend's existing value untouched; JSON.stringify already drops
      // `undefined` keys, so a plain string call (every pre-existing
      // caller) still sends exactly `{name}`.
      const body = typeof input === "string" ? { name: input } : input;
      const res = await api.patch("/auth/me", body);
      return toMe(res.data) as Me;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data);
      // Keep localStorage clinician name in sync so AppShell reflects the change
      const stored = getClinician();
      if (stored) {
        setSession({ ...stored, name: data.name }, data.mustChangePassword);
      }
    },
  });
};

// OMA-341 — expert requests: claim / reply / complete.

export const useClaimExpertRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      const res = await api.post(`/expert-requests/${requestId}/claim`);
      // status lands 'assigned' — the consent card was sent (or attempted,
      // see `sent`); she has to answer it before /reply will accept
      // anything (409 `awaiting_mother_consent` until then).
      return res.data as { id: string; status: string; sent: boolean; detail: string | null };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expert-requests", "queue"] });
      queryClient.invalidateQueries({ queryKey: ["expert-requests", "mine"] });
    },
  });
};

export const useSendExpertTyping = () => {
  return useMutation({
    mutationFn: async (requestId: string) => {
      const res = await api.post(`/expert-requests/${requestId}/typing`);
      return res.data as { sent: boolean };
    },
    // No cache invalidation — this is a fire-and-forget UX signal, not
    // state the rest of the app reads back.
  });
};

export const useReplyToExpertRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, body }: { requestId: string; body: string }) => {
      const res = await api.post(`/expert-requests/${requestId}/reply`, { body });
      return res.data as { id: string; status: string; sent: boolean; detail: string | null };
    },
    onSuccess: (_data, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: ["expert-requests", "thread", requestId] });
      queryClient.invalidateQueries({ queryKey: ["expert-requests", "mine"] });
    },
  });
};

export const useCompleteExpertRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      const res = await api.post(`/expert-requests/${requestId}/complete`);
      return res.data as { id: string; status: string; rating_prompt_sent: boolean };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expert-requests", "mine"] });
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const res = await api.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return res.data as { token: string; token_type: string; expires_in: number };
    },
    onSuccess: () => {
      // The backend re-set the session cookie with must_change_password
      // cleared; just clear the client-side flag.
      clearMustChange();
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
};
