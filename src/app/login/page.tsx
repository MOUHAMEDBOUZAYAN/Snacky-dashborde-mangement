"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/components/providers/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { localeToggleLabel, nextLocale, t } from "@/lib/i18n";

function SnackyMark({ className }: { className?: string }) {
  return (
    <div
      className={
        className ??
        "flex size-14 items-center justify-center rounded-2xl bg-brand-orange text-xl font-bold tracking-tight text-white shadow-sm shadow-brand-orange/30"
      }
    >
      S
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, locale, setLocale } = useAuth();

  useEffect(() => {
    if (!isLoading && user?.role === "ADMIN") {
      router.replace("/dashboard");
    }
  }, [isLoading, user, router]);

  if (isLoading || user?.role === "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand-cream px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,#ffedd5_0%,transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_100%,#dcfce7_0%,transparent_50%),radial-gradient(ellipse_50%_30%_at_0%_80%,#fed7aa_0%,transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,#f9731610_1px,transparent_1px),linear-gradient(to_bottom,#16a34a0d_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <div className="relative z-10 mb-8 flex w-full max-w-[420px] items-center justify-between">
        <div className="flex items-center gap-3">
          <SnackyMark className="flex size-10 items-center justify-center rounded-xl bg-brand-orange text-base font-bold text-white" />
          <div>
            <p className="text-lg font-semibold tracking-tight text-brand-charcoal">
              {t("brandName", locale)}
            </p>
            <p className="text-xs font-medium text-brand-green-700">
              {t("appTagline", locale)}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setLocale(nextLocale(locale))}
        >
          {localeToggleLabel(locale)}
        </Button>
      </div>

      <Card className="relative z-10 w-full max-w-[420px] border-brand-orange-200/80 bg-white/95 shadow-lg shadow-brand-orange/5 backdrop-blur-sm">
        <CardHeader className="space-y-2 pb-2 text-center">
          <CardTitle className="text-xl font-semibold text-brand-charcoal">
            {t("loginTitle", locale)}
          </CardTitle>
          <CardDescription className="text-pretty">
            {t("loginSubtitle", locale)}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <Suspense
            fallback={
              <div className="flex h-40 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>

      <p className="relative z-10 mt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {t("brandName", locale)}
      </p>
    </div>
  );
}
