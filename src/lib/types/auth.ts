export type UserRole = "ADMIN" | "CUSTOMER" | "STAFF" | string;

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: UserRole;
  isBlocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  /** Backend returns a duration string (e.g. "15m"); numbers (seconds) also accepted. */
  expiresIn: string | number;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

/** NestJS POST /auth/refresh payload after { success, data } unwrap. */
export interface RefreshResponse {
  tokens: AuthTokens;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export function getUserDisplayName(user: AuthUser): string {
  if (user.fullName?.trim()) return user.fullName.trim();
  if (user.name?.trim()) return user.name.trim();
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  return user.email;
}

/** Extract AuthTokens from nested `{ tokens }` or a flat tokens object. */
export function extractAuthTokens(payload: unknown): AuthTokens | null {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const nested = record.tokens;
  const candidate =
    nested && typeof nested === "object"
      ? (nested as Record<string, unknown>)
      : record;

  const accessToken = candidate.accessToken;
  const refreshToken = candidate.refreshToken;
  if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    tokenType:
      typeof candidate.tokenType === "string" ? candidate.tokenType : "Bearer",
    expiresIn:
      typeof candidate.expiresIn === "string" ||
      typeof candidate.expiresIn === "number"
        ? candidate.expiresIn
        : 0,
  };
}
