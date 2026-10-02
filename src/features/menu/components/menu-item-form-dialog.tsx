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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { t } from "@/lib/i18n";

import {
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
} from "../hooks";
import {
  createMenuItemSchema,
  toMenuItemPayload,
  type CreateMenuItemFormValues,
} from "../schemas";
import type { Category, MenuItem } from "../types";

interface MenuItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MenuItem | null;
  categories: Category[];
}

export function MenuItemFormDialog({
  open,
  onOpenChange,
  item,
  categories,
}: MenuItemFormDialogProps) {
  const { locale } = useAuth();
  const createMutation = useCreateMenuItemMutation();
  const updateMutation = useUpdateMenuItemMutation();
  const isEdit = Boolean(item);
  const pending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateMenuItemFormValues>({
    resolver: zodResolver(createMenuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      isAvailable: true,
      categoryId: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (item) {
      reset({
        name: item.name,
        description: item.description ?? "",
        price: item.price,
        imageUrl: item.imageUrl ?? "",
        isAvailable: item.isAvailable,
        categoryId: item.categoryId,
      });
    } else {
      reset({
        name: "",
        description: "",
        price: "" as unknown as number,
        imageUrl: "",
        isAvailable: true,
        categoryId: categories[0]?.id ?? "",
      });
    }
  }, [open, item, categories, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = toMenuItemPayload(values);

      if (isEdit && item) {
        await updateMutation.mutateAsync({ id: item.id, input: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch {
      // Toast handled in mutation onError
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={!pending}
      >
        <DialogHeader className="shrink-0 space-y-1.5 border-b border-border px-4 py-4 pr-12">
          <DialogTitle>
            {isEdit ? t("editMenuItem", locale) : t("addMenuItem", locale)}
          </DialogTitle>
          <DialogDescription>{t("menuSubtitle", locale)}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col"
          noValidate
        >
          <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto overscroll-contain px-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">{t("menuItemName", locale)}</Label>
              <Input
                id="item-name"
                aria-invalid={!!errors.name}
                disabled={pending}
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-description">
                {t("menuItemDescription", locale)}
              </Label>
              <Textarea
                id="item-description"
                rows={3}
                disabled={pending}
                {...register("description")}
              />
              {errors.description ? (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="item-price">{t("menuItemPrice", locale)}</Label>
                <Input
                  id="item-price"
                  type="number"
                  min={0.01}
                  step={0.01}
                  inputMode="decimal"
                  placeholder="30"
                  aria-invalid={!!errors.price}
                  disabled={pending}
                  {...register("price")}
                />
                {errors.price ? (
                  <p className="text-sm text-destructive">
                    {errors.price.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>{t("menuItemCategory", locale)}</Label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={pending || categories.length === 0}
                    >
                      <SelectTrigger
                        className="w-full"
                        aria-invalid={!!errors.categoryId}
                      >
                        <SelectValue
                          placeholder={t("selectCategory", locale)}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId ? (
                  <p className="text-sm text-destructive">
                    {errors.categoryId.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("menuItemImage", locale)}</Label>
              <Controller
                name="imageUrl"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    disabled={pending}
                  />
                )}
              />
              {errors.imageUrl ? (
                <p className="text-sm text-destructive">
                  {errors.imageUrl.message}
                </p>
              ) : null}
            </div>

            <Controller
              name="isAvailable"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                  <Label htmlFor="item-available">
                    {field.value
                      ? t("menuItemAvailable", locale)
                      : t("menuItemUnavailable", locale)}
                  </Label>
                  <Switch
                    id="item-available"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={pending}
                  />
                </div>
              )}
            />
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0 gap-2 rounded-b-xl rounded-t-none">
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
              disabled={pending || categories.length === 0}
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
