import { NextResponse, type NextRequest } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth-constants";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession =
    Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value) ||
    Boolean(request.cookies.get(REFRESH_TOKEN_COOKIE)?.value);

  const isAuthRoute = pathname === "/login" || pathname.startsWith("/login/");
  const isApi = pathname.startsWith("/api");
  const isNextAsset =
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.[a-zA-Z0-9]+$/.test(pathname);

  if (isApi || isNextAsset) {
    return NextResponse.next();
  }

  if (!hasSession && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
