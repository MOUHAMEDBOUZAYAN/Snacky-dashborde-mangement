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
import { formatPriceDh } from "@/lib/format";
import { t, tReplace } from "@/lib/i18n";

import { usePayoutDriverMutation } from "../hooks";
import type { Driver } from "../types";

interface PayoutDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver | null;
  unpaidAmount: number;
  onSuccess: () => void;
}

export function PayoutDriverDialog({
  open,
  onOpenChange,
  driver,
  unpaidAmount,
  onSuccess,
}: PayoutDriverDialogProps) {
  const { locale } = useAuth();
  const payoutMutation = usePayoutDriverMutation();

  async function handleConfirm() {
    if (!driver) return;
    if (unpaidAmount <= 0) {
      onOpenChange(false);
      return;
    }
    try {
      await payoutMutation.mutateAsync(driver.id);
      onOpenChange(false);
      onSuccess();
    } catch {
      // toast in mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("driverMarkPaid", locale)}</DialogTitle>
          <DialogDescription>
            {driver && unpaidAmount > 0
              ? tReplace(
                  "driverPayoutConfirm",
                  {
                    name: driver.fullName,
                    amount: formatPriceDh(unpaidAmount),
                  },
                  locale,
                )
              : t("driverPayoutNothing", locale)}
          </DialogDescription>
        </DialogHeader>

        {unpaidAmount > 0 ? (
          <p className="rounded-lg border border-brand-green-200 bg-brand-green-50 px-3 py-2 text-center text-lg font-semibold tabular-nums text-brand-green-800">
            {formatPriceDh(unpaidAmount)}
          </p>
        ) : null}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={payoutMutation.isPending}
          >
            {t("cancel", locale)}
          </Button>
          <Button
            type="button"
            disabled={
              payoutMutation.isPending || !driver || unpaidAmount <= 0
            }
            className="bg-brand-green-600 hover:bg-brand-green-700"
            onClick={handleConfirm}
          >
            {payoutMutation.isPending
              ? t("loading", locale)
              : t("driverMarkPaid", locale)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
