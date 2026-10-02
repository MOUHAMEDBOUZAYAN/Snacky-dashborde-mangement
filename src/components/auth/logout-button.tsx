"use client";

import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { t } from "@/lib/i18n";

export function LogoutButton() {
  const router = useRouter();
  const { locale, clearSession } = useAuth();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      clearSession();
      setOpen(false);
      router.replace("/login");
      router.refresh();
      setPending(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={pending}
        className="border-brand-orange-200"
      >
        <LogOut data-icon="inline-start" />
        {t("logout", locale)}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (pending) return;
          setOpen(next);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("logoutConfirmTitle", locale)}</DialogTitle>
            <DialogDescription>
              {t("logoutConfirmDescription", locale)}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              {t("cancel", locale)}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={handleLogout}
              className="gap-1.5"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              {pending ? t("loading", locale) : t("logout", locale)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
