import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status >= 500) {
      window.dispatchEvent(
        new CustomEvent("omaya:server-error", {
          detail: {
            message:
              error.response?.data?.detail ??
              "An unexpected server error occurred. Please try again.",
          },
        })
      );
    }
    return Promise.reject(error);
  }
);
