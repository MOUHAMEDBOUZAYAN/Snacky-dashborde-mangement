"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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

import { useUpdateDriverCommissionMutation } from "../hooks";
import {
  updateDriverCommissionSchema,
  type UpdateDriverCommissionFormValues,
} from "../schemas";
import type { Driver } from "../types";

interface EditCommissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver | null;
}

export function EditCommissionDialog({
  open,
  onOpenChange,
  driver,
}: EditCommissionDialogProps) {
  const { locale } = useAuth();
  const updateMutation = useUpdateDriverCommissionMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateDriverCommissionFormValues>({
    resolver: zodResolver(updateDriverCommissionSchema),
    defaultValues: { commissionPercent: 20 },
  });

  useEffect(() => {
    if (driver && open) {
      reset({ commissionPercent: driver.commissionPercent ?? 0 });
    }
  }, [driver, open, reset]);

  async function onSubmit(values: UpdateDriverCommissionFormValues) {
    if (!driver) return;
    try {
      await updateMutation.mutateAsync({ id: driver.id, payload: values });
      onOpenChange(false);
    } catch {
      // toast in mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("driverEditCommissionTitle", locale)}</DialogTitle>
          <DialogDescription>
            {driver?.fullName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-commission">
              {t("driverCommissionPercent", locale)}
            </Label>
            <Input
              id="edit-commission"
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
              disabled={updateMutation.isPending}
              onClick={() => onOpenChange(false)}
            >
              {t("cancel", locale)}
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending || !driver}
              className="bg-brand-orange hover:bg-brand-orange-600"
            >
              {updateMutation.isPending ? t("loading", locale) : t("save", locale)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
