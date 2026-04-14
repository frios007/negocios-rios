import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { ApiResponse, User } from "./types";

export const authApiClient = axios.create({
  baseURL: env.VITE_API_URL + "/api/v1",
  withCredentials: true,
});

authApiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ─── Main API Client ──────────────────────────────────────────
// Used for all tenant-scoped requests.
// Attaches both Authorization + X-Business-Unit-ID headers.
// Implements silent 401 refresh with request queuing.

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL + "/api/v1",
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const { accessToken, activeBusinessUnitId } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (activeBusinessUnitId) {
    config.headers["X-Business-Unit-ID"] = activeBusinessUnitId;
  }

  return config;
});

// ─── Silent Refresh Interceptor (Mutex Pattern) ───────────────

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null) {
  for (const promise of failedQueue) {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  }
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only intercept 401s, and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      // Call refresh endpoint — the cookie is sent automatically
      const { data } =
        await authApiClient.post<
          ApiResponse<{ user: User; accessToken: string }>
        >("/auth/refresh");

      const newAccessToken = data.data.accessToken;

      // Update the store with the new token
      useAuthStore.getState().setAccessToken(newAccessToken);

      // Replay all queued requests
      processQueue(null, newAccessToken);

      // Retry the original request
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh failed — session is dead
      processQueue(refreshError, null);
      useAuthStore.getState().logout();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
