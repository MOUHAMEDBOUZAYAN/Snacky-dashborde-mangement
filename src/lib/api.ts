import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import type { ApiEnvelope, AuthTokens } from "@/lib/types/auth";
import { extractAuthTokens } from "@/lib/types/auth";

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let memoryAccessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

type SessionExpiredListener = () => void;
const sessionExpiredListeners = new Set<SessionExpiredListener>();

export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
}

function notifySessionExpired(): void {
  for (const listener of sessionExpiredListeners) {
    listener();
  }
}

export function setAccessToken(token: string | null): void {
  memoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return memoryAccessToken;
}

function resolveBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env.local.",
    );
  }
  return url.replace(/\/$/, "");
}

function unwrapData<T>(payload: unknown): T {
  if (
    payload !== null &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    const envelope = payload as ApiEnvelope<T>;
    return envelope.data;
  }
  return payload as T;
}

function isAuthBootstrapUrl(url: string | undefined): boolean {
  if (!url) return false;
  return /\/auth\/(login|register|refresh)(\?|$)/.test(url);
}

/**
 * Calls the Next.js BFF refresh route (reads httpOnly refresh cookie, re-sets both).
 * Response shape: { accessToken, tokens }.
 */
async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    setAccessToken(null);
    return null;
  }

  const body = (await res.json()) as {
    accessToken?: string;
    tokens?: AuthTokens;
  };

  const fromNested = extractAuthTokens(body);
  const token =
    (typeof body.accessToken === "string" && body.accessToken) ||
    fromNested?.accessToken ||
    null;

  if (!token) {
    // Shape mismatch must not look like an expired session — treat as failure
    // but do not leave a half-broken memory token.
    setAccessToken(null);
    return null;
  }

  setAccessToken(token);
  return token;
}

function queueRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export const api: AxiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  config.baseURL = resolveBaseUrl();
  const token = memoryAccessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Let the browser set multipart boundary for FormData uploads.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    response.data = unwrapData(response.data);
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    const shouldAttemptRefresh =
      status === 401 &&
      original &&
      !original._retry &&
      typeof window !== "undefined" &&
      !isAuthBootstrapUrl(original.url);

    if (shouldAttemptRefresh) {
      original._retry = true;
      const token = await queueRefresh();
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
      // Refresh genuinely failed (invalid/expired refresh) — end session.
      notifySessionExpired();
    }

    const payload = error.response?.data as
      | { message?: string | string[]; error?: string }
      | undefined;
    const message = Array.isArray(payload?.message)
      ? payload.message.join(", ")
      : payload?.message || payload?.error || error.message;

    return Promise.reject(new Error(message));
  },
);

/** Server-side helper that attaches a Bearer token explicitly. */
export function createServerApi(accessToken: string): AxiosInstance {
  const instance = axios.create({
    baseURL: resolveBaseUrl(),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  instance.interceptors.response.use(
    (response) => {
      response.data = unwrapData(response.data);
      return response;
    },
    (error: AxiosError) => {
      const payload = error.response?.data as
        | { message?: string | string[] }
        | undefined;
      const message = Array.isArray(payload?.message)
        ? payload.message.join(", ")
        : payload?.message || error.message;
      return Promise.reject(new Error(message));
    },
  );

  return instance;
}
