"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

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
  useCreateSauceMutation,
  useUpdateSauceMutation,
} from "../hooks";
import {
  createSauceSchema,
  type CreateSauceFormValues,
} from "../schemas";
import type { Sauce } from "../types";

interface SauceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sauce?: Sauce | null;
}

export function SauceFormDialog({
  open,
  onOpenChange,
  sauce,
}: SauceFormDialogProps) {
  const { locale } = useAuth();
  const createMutation = useCreateSauceMutation();
  const updateMutation = useUpdateSauceMutation();
  const isEdit = Boolean(sauce);
  const pending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateSauceFormValues>({
    resolver: zodResolver(createSauceSchema),
    defaultValues: {
      name: "",
      sortOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (sauce) {
      reset({
        name: sauce.name,
        sortOrder: sauce.sortOrder,
        isActive: sauce.isActive,
      });
    } else {
      reset({ name: "", sortOrder: 0, isActive: true });
    }
  }, [open, sauce, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEdit && sauce) {
        await updateMutation.mutateAsync({
          id: sauce.id,
          input: {
            name: values.name.trim(),
            sortOrder: values.sortOrder,
            isActive: values.isActive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: values.name.trim(),
          sortOrder: values.sortOrder,
          isActive: values.isActive,
        });
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
            {isEdit ? t("editSauce", locale) : t("addSauce", locale)}
          </DialogTitle>
          <DialogDescription>{t("saucesSubtitle", locale)}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="sauce-name">{t("sauceName", locale)}</Label>
            <Input
              id="sauce-name"
              aria-invalid={!!errors.name}
              disabled={pending}
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sauce-sort">{t("sauceSortOrder", locale)}</Label>
            <Input
              id="sauce-sort"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
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
                <Label htmlFor="sauce-active">
                  {field.value
                    ? t("sauceActive", locale)
                    : t("sauceInactive", locale)}
                </Label>
                <Switch
                  id="sauce-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={pending}
                />
              </div>
            )}
          />

          <DialogFooter className="gap-2">
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
