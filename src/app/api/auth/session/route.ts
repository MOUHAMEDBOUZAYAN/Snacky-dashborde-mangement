import { NextResponse } from "next/server";
import { AxiosError } from "axios";

import { assertAdmin, fetchMe, refreshWithApi } from "@/lib/auth";
import {
  clearAuthCookies,
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  setAuthCookies,
} from "@/lib/auth-cookies";
import type { AuthTokens, AuthUser } from "@/lib/types/auth";

async function restoreViaRefresh(
  refreshToken: string,
): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const tokens = await refreshWithApi(refreshToken);
  const user = await fetchMe(tokens.accessToken);
  assertAdmin(user);
  return { user, tokens };
}

export async function GET() {
  const accessToken = await getAccessTokenFromCookies();
  const refreshToken = await getRefreshTokenFromCookies();

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  // Prefer the current access token; on failure, fall back to refresh.
  if (accessToken) {
    try {
      const user = await fetchMe(accessToken);
      assertAdmin(user);
      return NextResponse.json({ user, accessToken });
    } catch (error) {
      const isForbidden =
        error instanceof Error && error.message.includes("Access restricted");
      if (isForbidden || !refreshToken) {
        const status = isForbidden ? 403 : 401;
        const res = NextResponse.json(
          {
            message:
              error instanceof Error ? error.message : "Session invalid",
          },
          { status },
        );
        clearAuthCookies(res);
        return res;
      }
      // Expired/invalid access token — try refresh below.
    }
  }

  if (!refreshToken) {
    const res = NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    clearAuthCookies(res);
    return res;
  }

  try {
    const { user, tokens } = await restoreViaRefresh(refreshToken);
    const res = NextResponse.json({
      user,
      accessToken: tokens.accessToken,
    });
    setAuthCookies(res, tokens);
    return res;
  } catch (error) {
    const status =
      error instanceof AxiosError
        ? (error.response?.status ?? 401)
        : error instanceof Error &&
            error.message.includes("Access restricted")
          ? 403
          : 401;

    const res = NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Session invalid",
      },
      { status },
    );
    clearAuthCookies(res);
    return res;
  }
}
