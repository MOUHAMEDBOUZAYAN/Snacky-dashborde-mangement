"use client";

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
import { t, tReplace } from "@/lib/i18n";

import { useBlockDriverMutation } from "../hooks";
import type { Driver } from "../types";

interface BlockDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver | null;
}

export function BlockDriverDialog({
  open,
  onOpenChange,
  driver,
}: BlockDriverDialogProps) {
  const { locale } = useAuth();
  const blockMutation = useBlockDriverMutation();

  async function handleConfirm() {
    if (!driver) return;
    try {
      await blockMutation.mutateAsync(driver.id);
      onOpenChange(false);
    } catch {
      // toast in mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("userBlock", locale)}</DialogTitle>
          <DialogDescription>
            {driver
              ? tReplace("userBlockConfirm", { name: driver.fullName }, locale)
              : null}
          </DialogDescription>
        </DialogHeader>

        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {t("driverBlockExplain", locale)}
        </p>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={blockMutation.isPending}
          >
            {t("cancel", locale)}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={blockMutation.isPending || !driver}
            onClick={handleConfirm}
          >
            {blockMutation.isPending
              ? t("loading", locale)
              : t("userBlock", locale)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
