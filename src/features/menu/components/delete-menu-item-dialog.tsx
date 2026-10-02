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

import { useDeleteMenuItemMutation } from "../hooks";
import type { MenuItem } from "../types";

interface DeleteMenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItem | null;
}

export function DeleteMenuItemDialog({
  open,
  onOpenChange,
  item,
}: DeleteMenuItemDialogProps) {
  const { locale } = useAuth();
  const deleteMutation = useDeleteMenuItemMutation();

  async function handleConfirm() {
    if (!item) return;
    await deleteMutation.mutateAsync(item.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("deleteMenuItem", locale)}</DialogTitle>
          <DialogDescription>
            {item
              ? tReplace("menuItemDeleteConfirm", { name: item.name }, locale)
              : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={deleteMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            {t("cancel", locale)}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMutation.isPending || !item}
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
