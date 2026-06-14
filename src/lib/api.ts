import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { getToken, clearSession } from "./auth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach the portal JWT as a Bearer token on every request when signed in.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<unknown>) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";

    // A 401 on a protected request means the token expired/was revoked.
    // The /auth/* endpoints handle their own 401s inline (wrong password,
    // bad setup token), so don't hijack those.
    if (status === 401 && !url.startsWith("/auth/")) {
      clearSession();
      if (window.location.pathname !== "/") {
        window.location.assign("/");
      }
    }

    if (status !== undefined && status >= 500) {
      toast.error(extractApiError(error).message);
    }
    return Promise.reject(error);
  },
);

export interface ApiError {
  error_code: string;
  message: string;
  status: number;
}

/**
 * Normalize an axios error into the backend's `{error_code, message}`
 * envelope (carried under `detail`). Falls back gracefully for 422
 * validation lists and non-HTTP failures (network/timeout).
 */
export function extractApiError(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): ApiError {
  const ax = err as AxiosError<{ detail?: unknown }>;
  const status = ax.response?.status ?? 0;
  const detail = ax.response?.data?.detail;

  // Canonical auth envelope: detail = {error_code, message}
  if (
    detail &&
    typeof detail === "object" &&
    !Array.isArray(detail) &&
    "error_code" in detail
  ) {
    const d = detail as { error_code: string; message?: string };
    return { error_code: d.error_code, message: d.message ?? fallback, status };
  }

  // FastAPI request-validation error: detail = [{msg, ...}, ...]
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string };
    return {
      error_code: "validation_error",
      message: first.msg ?? fallback,
      status,
    };
  }

  if (ax.code === "ECONNABORTED" || ax.message === "Network Error") {
    return {
      error_code: "network_error",
      message: "Can't reach the server. Check your connection and try again.",
      status,
    };
  }

  return { error_code: "unknown", message: fallback, status };
}
