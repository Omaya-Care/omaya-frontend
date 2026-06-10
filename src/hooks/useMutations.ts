import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { components } from "../types/api-generated";

type CreateClinicianRequest = components["schemas"]["CreateClinicianRequest"];

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
 * Hook to trigger an ad-hoc check-in call.
 * Uses POST /mothers/{mother_id}/calls from the API.
 */
export const useTriggerCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (motherId: string) => {
      const response = await api.post(`/mothers/${motherId}/calls`);
      return response.data;
    },
    onSuccess: () => {
      // Refresh calls list
      queryClient.invalidateQueries({ queryKey: ["calls"] });
    },
  });
};

/**
 * Hook to confirm consent/withdrawal (sends SMS).
 */
export const useConfirmConsentAction = (type: "consent" | "withdrawal") => {
  return useMutation({
    mutationFn: async (motherId: string) => {
      const endpoint =
        type === "consent"
          ? `/mothers/${motherId}/confirm-consent`
          : `/mothers/${motherId}/confirm-withdrawal`;
      const response = await api.post(endpoint);
      return response.data;
    },
  });
};

/**
 * Hook to add a new staff member (clinician).
 */
export const useAddStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateClinicianRequest) => {
      const response = await api.post("/admin/clinicians", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};
