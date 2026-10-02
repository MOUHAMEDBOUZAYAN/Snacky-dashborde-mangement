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

import { useDeleteCategoryMutation } from "../hooks";
import type { Category } from "../types";

interface DeleteCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  itemCount: number;
}

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
  itemCount,
}: DeleteCategoryDialogProps) {
  const { locale } = useAuth();
  const deleteMutation = useDeleteCategoryMutation();
  const blocked = itemCount > 0;

  async function handleConfirm() {
    if (!category || blocked) return;
    await deleteMutation.mutateAsync(category.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("deleteCategory", locale)}</DialogTitle>
          <DialogDescription>
            {category
              ? tReplace(
                  "categoryDeleteConfirm",
                  { name: category.name },
                  locale,
                )
              : null}
          </DialogDescription>
        </DialogHeader>

        {blocked ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {tReplace("categoryDeleteHasItems", { count: itemCount }, locale)}
          </p>
        ) : null}

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
            disabled={blocked || deleteMutation.isPending || !category}
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
