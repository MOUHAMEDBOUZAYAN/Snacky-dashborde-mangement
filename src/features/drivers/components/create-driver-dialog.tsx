"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { t } from "@/lib/i18n";

import { useCreateDriverMutation } from "../hooks";
import {
  createDriverSchema,
  type CreateDriverFormValues,
} from "../schemas";

interface CreateDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDriverDialog({
  open,
  onOpenChange,
}: CreateDriverDialogProps) {
  const { locale } = useAuth();
  const createMutation = useCreateDriverMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDriverFormValues>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      commissionPercent: 20,
    },
  });

  async function onSubmit(values: CreateDriverFormValues) {
    try {
      await createMutation.mutateAsync(values);
      reset();
      onOpenChange(false);
    } catch {
      // toast in mutation
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("driverCreateTitle", locale)}</DialogTitle>
          <DialogDescription>{t("driversSubtitle", locale)}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="driver-fullName">{t("driverFullName", locale)}</Label>
            <Input id="driver-fullName" {...register("fullName")} />
            {errors.fullName ? (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver-email">{t("email", locale)}</Label>
            <Input id="driver-email" type="email" {...register("email")} />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver-phone">{t("orderCustomerPhone", locale)}</Label>
            <Input id="driver-phone" {...register("phone")} />
            {errors.phone ? (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver-password">{t("driverPassword", locale)}</Label>
            <Input id="driver-password" type="password" {...register("password")} />
            {errors.password ? (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver-commission">
              {t("driverCommissionPercent", locale)}
            </Label>
            <Input
              id="driver-commission"
              type="number"
              step="0.01"
              min={0}
              max={100}
              {...register("commissionPercent")}
            />
            {errors.commissionPercent ? (
              <p className="text-xs text-destructive">
                {errors.commissionPercent.message}
              </p>
            ) : null}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={createMutation.isPending}
              onClick={() => onOpenChange(false)}
            >
              {t("cancel", locale)}
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-brand-orange hover:bg-brand-orange-600"
            >
              {createMutation.isPending
                ? t("loading", locale)
                : t("driverAdd", locale)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
