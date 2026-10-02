import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  COOKIE_MAX_AGE_ACCESS,
  COOKIE_MAX_AGE_REFRESH,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth-constants";
import type { AuthTokens } from "@/lib/types/auth";

const isProd = process.env.NODE_ENV === "production";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** Parse Nest JWT expiresIn ("15m", "7d", "60") into seconds. */
export function expiresInToSeconds(
  expiresIn: string | number | undefined,
): number {
  if (typeof expiresIn === "number" && Number.isFinite(expiresIn) && expiresIn > 0) {
    return Math.floor(expiresIn);
  }

  if (typeof expiresIn === "string") {
    const trimmed = expiresIn.trim();
    const match = trimmed.match(/^(\d+)\s*([smhd])$/i);
    if (match) {
      const value = Number(match[1]);
      const unit = match[2].toLowerCase();
      const factor =
        unit === "s" ? 1 : unit === "m" ? 60 : unit === "h" ? 3600 : 86400;
      return value * factor;
    }
    const asNumber = Number(trimmed);
    if (Number.isFinite(asNumber) && asNumber > 0) {
      return Math.floor(asNumber);
    }
  }

  return COOKIE_MAX_AGE_ACCESS;
}

export function setAuthCookies(
  response: NextResponse,
  tokens: AuthTokens,
): void {
  if (!tokens.accessToken || !tokens.refreshToken) {
    throw new Error("Cannot set auth cookies without access and refresh tokens");
  }

  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    cookieOptions(expiresInToSeconds(tokens.expiresIn)),
  );
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    cookieOptions(COOKIE_MAX_AGE_REFRESH),
  );
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", cookieOptions(0));
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", cookieOptions(0));
  response.cookies.delete({ name: ACCESS_TOKEN_COOKIE, path: "/" });
  response.cookies.delete({ name: REFRESH_TOKEN_COOKIE, path: "/" });
}

export async function getAccessTokenFromCookies(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshTokenFromCookies(): Promise<
  string | undefined
> {
  const jar = await cookies();
  return jar.get(REFRESH_TOKEN_COOKIE)?.value;
}
