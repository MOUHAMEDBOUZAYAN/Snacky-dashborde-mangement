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

import { useDeleteSauceMutation } from "../hooks";
import type { Sauce } from "../types";

interface DeleteSauceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sauce: Sauce | null;
}

export function DeleteSauceDialog({
  open,
  onOpenChange,
  sauce,
}: DeleteSauceDialogProps) {
  const { locale } = useAuth();
  const deleteMutation = useDeleteSauceMutation();

  async function handleConfirm() {
    if (!sauce) return;
    try {
      await deleteMutation.mutateAsync(sauce.id);
      onOpenChange(false);
    } catch {
      // Toast handled in mutation onError
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("deleteSauce", locale)}</DialogTitle>
          <DialogDescription>
            {sauce
              ? tReplace("sauceDeleteConfirm", { name: sauce.name }, locale)
              : null}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            {t("cancel", locale)}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMutation.isPending || !sauce}
            onClick={handleConfirm}
          >
            {deleteMutation.isPending
              ? t("loading", locale)
              : t("delete", locale)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
