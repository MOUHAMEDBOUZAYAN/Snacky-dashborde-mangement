"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { t } from "@/lib/i18n";

import { SaucesSection } from "./sauces-section";

export function SaucesPageView() {
  const { locale } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-brand-charcoal">
          {t("saucesTitle", locale)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("saucesSubtitle", locale)}
        </p>
      </div>

      <SaucesSection />
    </div>
  );
}
