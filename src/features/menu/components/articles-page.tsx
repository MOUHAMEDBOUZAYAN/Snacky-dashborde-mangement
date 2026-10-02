"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { t } from "@/lib/i18n";

import { MenuItemsSection } from "@/features/menu/components/menu-items-section";

export function ArticlesPageView() {
  const { locale } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-brand-charcoal">
          {t("articlesTitle", locale)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("articlesSubtitle", locale)}
        </p>
      </div>

      <MenuItemsSection />
    </div>
  );
}
