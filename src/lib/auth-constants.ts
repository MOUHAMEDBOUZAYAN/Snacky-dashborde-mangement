export const ACCESS_TOKEN_COOKIE = "snacky_access_token";
export const REFRESH_TOKEN_COOKIE = "snacky_refresh_token";

export const COOKIE_MAX_AGE_ACCESS = 60 * 60; // 1 hour fallback
export const COOKIE_MAX_AGE_REFRESH = 60 * 60 * 24 * 7; // 7 days

export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env.local.",
    );
  }
  return url.replace(/\/$/, "");
}
