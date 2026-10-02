import axios from "axios";

import { getApiBaseUrl } from "@/lib/auth-constants";
import type {
  ApiEnvelope,
  AuthTokens,
  AuthUser,
  LoginResponse,
} from "@/lib/types/auth";
import { extractAuthTokens } from "@/lib/types/auth";

function unwrap<T>(payload: unknown): T {
  if (
    payload !== null &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
}

const serverHttp = axios.create({
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export async function loginWithApi(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await serverHttp.post(
    `${getApiBaseUrl()}/auth/login`,
    { email, password },
  );
  const login = unwrap<LoginResponse>(data);
  const tokens = extractAuthTokens(login) ?? extractAuthTokens(login.tokens);

  if (!login.user || !tokens) {
    throw new Error("Invalid login response: missing user or tokens");
  }

  return { user: login.user, tokens };
}

export async function fetchMe(accessToken: string): Promise<AuthUser> {
  const { data } = await serverHttp.get(`${getApiBaseUrl()}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const user = unwrap<AuthUser>(data);
  if (!user?.id || !user?.email || !user?.role) {
    throw new Error("Invalid /auth/me response");
  }
  return user;
}

/**
 * POST /auth/refresh → after unwrap: `{ tokens: { accessToken, refreshToken, ... } }`.
 */
export async function refreshWithApi(
  refreshToken: string,
): Promise<AuthTokens> {
  const { data } = await serverHttp.post(`${getApiBaseUrl()}/auth/refresh`, {
    refreshToken,
  });
  const payload = unwrap<unknown>(data);
  const tokens = extractAuthTokens(payload);

  if (!tokens) {
    throw new Error("Invalid refresh response: missing nested tokens");
  }

  return tokens;
}

export function assertAdmin(user: AuthUser): void {
  if (user.role !== "ADMIN") {
    throw new Error("Access restricted to admins");
  }
}
