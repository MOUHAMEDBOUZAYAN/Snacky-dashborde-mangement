"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { t } from "@/lib/i18n";

import { CategoriesSection } from "@/features/menu/components/categories-section";

export function CategoriesPageView() {
  const { locale } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-brand-charcoal">
          {t("categoriesTitle", locale)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("categoriesSubtitle", locale)}
        </p>
      </div>

      <CategoriesSection />
    </div>
  );
}
