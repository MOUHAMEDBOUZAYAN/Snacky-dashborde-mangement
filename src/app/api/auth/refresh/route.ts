import { NextResponse } from "next/server";
import { AxiosError } from "axios";

import { refreshWithApi } from "@/lib/auth";
import {
  clearAuthCookies,
  getRefreshTokenFromCookies,
  setAuthCookies,
} from "@/lib/auth-cookies";

export async function POST() {
  try {
    const refreshToken = await getRefreshTokenFromCookies();
    if (!refreshToken) {
      const res = NextResponse.json(
        { message: "No refresh token" },
        { status: 401 },
      );
      clearAuthCookies(res);
      return res;
    }

    // Nest returns { tokens: { accessToken, refreshToken, ... } } after unwrap.
    const tokens = await refreshWithApi(refreshToken);
    const res = NextResponse.json({
      accessToken: tokens.accessToken,
      tokens,
    });
    setAuthCookies(res, tokens);
    return res;
  } catch (error) {
    const status =
      error instanceof AxiosError ? (error.response?.status ?? 401) : 401;
    const res = NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Refresh failed",
      },
      { status },
    );
    clearAuthCookies(res);
    return res;
  }
}
