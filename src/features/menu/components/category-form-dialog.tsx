"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { t } from "@/lib/i18n";

import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "../hooks";
import {
  createCategorySchema,
  type CreateCategoryFormValues,
} from "../schemas";
import type { Category } from "../types";
import { slugify } from "../utils";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: CategoryFormDialogProps) {
  const { locale } = useAuth();
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const isEdit = Boolean(category);
  const pending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      sortOrder: 0,
      isActive: true,
    },
  });

  const nameValue = useWatch({ control, name: "name" });

  useEffect(() => {
    if (!open) return;
    if (category) {
      reset({
        name: category.name,
        slug: category.slug,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      });
    } else {
      reset({ name: "", slug: "", sortOrder: 0, isActive: true });
    }
  }, [open, category, reset]);

  // Auto-slug from name when creating (and when slug still empty / mirrors previous auto).
  useEffect(() => {
    if (!open || isEdit) return;
    const next = slugify(nameValue ?? "");
    if (next) setValue("slug", next, { shouldValidate: true });
  }, [nameValue, open, isEdit, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEdit && category) {
        await updateMutation.mutateAsync({ id: category.id, input: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      onOpenChange(false);
    } catch {
      // Toast handled in mutation onError
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("editCategory", locale) : t("addCategory", locale)}
          </DialogTitle>
          <DialogDescription>{t("menuSubtitle", locale)}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="category-name">{t("categoryName", locale)}</Label>
            <Input
              id="category-name"
              aria-invalid={!!errors.name}
              disabled={pending}
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-slug">{t("categorySlug", locale)}</Label>
            <Input
              id="category-slug"
              aria-invalid={!!errors.slug}
              disabled={pending}
              {...register("slug")}
            />
            {errors.slug ? (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-sort">
              {t("categorySortOrder", locale)}
            </Label>
            <Input
              id="category-sort"
              type="number"
              min={0}
              step={1}
              aria-invalid={!!errors.sortOrder}
              disabled={pending}
              {...register("sortOrder")}
            />
            {errors.sortOrder ? (
              <p className="text-sm text-destructive">
                {errors.sortOrder.message}
              </p>
            ) : null}
          </div>

          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                <Label htmlFor="category-active">
                  {field.value
                    ? t("categoryActive", locale)
                    : t("categoryInactive", locale)}
                </Label>
                <Switch
                  id="category-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={pending}
                />
              </div>
            )}
          />

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              {t("cancel", locale)}
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="bg-brand-orange hover:bg-brand-orange-600"
            >
              {pending ? t("loading", locale) : t("save", locale)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
