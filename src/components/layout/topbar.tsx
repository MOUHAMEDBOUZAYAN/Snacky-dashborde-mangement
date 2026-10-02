"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { localeToggleLabel, nextLocale, t, type Locale } from "@/lib/i18n";
import { getUserDisplayName } from "@/lib/types/auth";

function LocaleToggle() {
  const { locale, setLocale } = useAuth();

  function toggle() {
    setLocale(nextLocale(locale));
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label={t("language", locale)}
      className="min-w-9 font-semibold text-muted-foreground"
    >
      {localeToggleLabel(locale)}
    </Button>
  );
}

export function Topbar() {
  const { user, locale } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const name = user ? getUserDisplayName(user) : "";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-brand-orange-100 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Menu"
              >
                <Menu className="size-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-72 border-sidebar-border p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>{t("appName", locale)}</SheetTitle>
            </SheetHeader>
            <Sidebar
              className="h-full w-full border-0"
              onNavigate={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <p className="hidden truncate text-sm text-muted-foreground sm:block">
          {t("welcome", locale)}
          {name ? (
            <>
              , <span className="font-medium text-foreground">{name}</span>
            </>
          ) : null}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <p className="max-w-[10rem] truncate text-sm font-medium sm:hidden">
          {name}
        </p>
        <LocaleToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
