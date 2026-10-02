"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { onSessionExpired, setAccessToken } from "@/lib/api";
import { DEFAULT_LOCALE, isLocale, localeDir, localeHtmlLang, type Locale } from "@/lib/i18n";
import type { AuthUser } from "@/lib/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isLoading: boolean;
  setSession: (user: AuthUser, accessToken: string) => void;
  clearSession: () => void;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const LOCALE_KEY = "snacky_admin_locale";
const LOCALE_EVENT = "snacky-locale-change";

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(LOCALE_KEY);
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
}

function applyDocumentLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = localeHtmlLang(locale);
  document.documentElement.dir = localeDir(locale);
}

function subscribeLocale(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(LOCALE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(LOCALE_EVENT, onStoreChange);
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const locale = useSyncExternalStore(
    subscribeLocale,
    readStoredLocale,
    () => DEFAULT_LOCALE,
  );

  const setLocale = useCallback((next: Locale) => {
    window.localStorage.setItem(LOCALE_KEY, next);
    applyDocumentLocale(next);
    window.dispatchEvent(new Event(LOCALE_EVENT));
  }, []);

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const setSession = useCallback((nextUser: AuthUser, accessToken: string) => {
    setAccessToken(accessToken);
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      if (!res.ok) {
        clearSession();
        return false;
      }
      const data = (await res.json()) as {
        user: AuthUser;
        accessToken: string;
      };
      setSession(data.user, data.accessToken);
      return true;
    } catch {
      // Network failure: clear httpOnly cookies too so proxy doesn't bounce
      // authenticated routes ↔ /login in a loop.
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch {
        // ignore
      }
      clearSession();
      return false;
    }
  }, [clearSession, setSession]);

  // Boot session once on mount.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await refreshSession();
      if (!cancelled) {
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // One-shot boot: refreshSession is stable enough; re-running on identity
    // changes would reintroduce fetch loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep <html lang> in sync with the locale toggle.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // When axios refresh fails, clear client session + cookies and bounce to login.
  useEffect(() => {
    return onSessionExpired(() => {
      void fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }).finally(() => {
        clearSession();
        if (!pathname.startsWith("/login")) {
          router.replace("/login");
        }
      });
    });
  }, [clearSession, pathname, router]);

  const value = useMemo(
    () => ({
      user,
      locale,
      setLocale,
      isLoading,
      setSession,
      clearSession,
      refreshSession,
    }),
    [
      user,
      locale,
      setLocale,
      isLoading,
      setSession,
      clearSession,
      refreshSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
