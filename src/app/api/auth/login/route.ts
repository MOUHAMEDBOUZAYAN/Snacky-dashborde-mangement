import { NextResponse } from "next/server";
import { AxiosError } from "axios";

import { assertAdmin, fetchMe, loginWithApi } from "@/lib/auth";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth-cookies";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!body.email?.trim() || !body.password) {
      return NextResponse.json(
        {
          code: "INVALID_CREDENTIALS",
          message: "Invalid credentials",
          messageFr: "Identifiants invalides",
        },
        { status: 400 },
      );
    }

    let login;
    try {
      login = await loginWithApi(body.email.trim(), body.password);
    } catch {
      return NextResponse.json(
        {
          code: "INVALID_CREDENTIALS",
          message: "Invalid credentials",
          messageFr: "Identifiants invalides",
        },
        { status: 401 },
      );
    }

    const user = await fetchMe(login.tokens.accessToken);

    try {
      assertAdmin(user);
    } catch {
      const res = NextResponse.json(
        {
          code: "ACCESS_RESTRICTED",
          message: "Access restricted to admins",
          messageFr: "Accès réservé aux administrateurs",
        },
        { status: 403 },
      );
      clearAuthCookies(res);
      return res;
    }

    const res = NextResponse.json({
      user,
      accessToken: login.tokens.accessToken,
    });
    setAuthCookies(res, login.tokens);
    return res;
  } catch (error) {
    const status =
      error instanceof AxiosError ? (error.response?.status ?? 401) : 401;
    return NextResponse.json(
      {
        code: "INVALID_CREDENTIALS",
        message: "Invalid credentials",
        messageFr: "Identifiants invalides",
      },
      { status },
    );
  }
}
