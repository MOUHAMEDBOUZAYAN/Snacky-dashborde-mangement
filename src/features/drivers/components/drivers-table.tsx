"use client";

import { Ban, CheckCircle2, MoreHorizontal, Pencil, Truck } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPriceDh } from "@/lib/format";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { StarScore } from "@/components/ui/star-score";

import type { Driver } from "../types";

export function DriversTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

interface DriversTableProps {
  drivers: Driver[];
  pendingDriverId: string | null;
  onViewDetails: (driver: Driver) => void;
  onEditCommission: (driver: Driver) => void;
  onBlock: (driver: Driver) => void;
  onUnblock: (driver: Driver) => void;
}

export function DriversTable({
  drivers,
  pendingDriverId,
  onViewDetails,
  onEditCommission,
  onBlock,
  onUnblock,
}: DriversTableProps) {
  const { locale } = useAuth();

  if (drivers.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-brand-orange-200 bg-brand-orange-50/40 px-4 py-10 text-center text-sm text-muted-foreground">
        {t("driversEmpty", locale)}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("userName", locale)}</TableHead>
          <TableHead className="hidden md:table-cell">
            {t("userContact", locale)}
          </TableHead>
          <TableHead className="text-right tabular-nums">
            {t("driverCommission", locale)}
          </TableHead>
          <TableHead className="hidden text-right tabular-nums sm:table-cell">
            {t("driverCompletedDeliveries", locale)}
          </TableHead>
          <TableHead className="hidden text-right tabular-nums sm:table-cell">
            {t("driverCancelledDeliveries", locale)}
          </TableHead>
          <TableHead className="text-right tabular-nums">
            {t("driverTotalEarned", locale)}
          </TableHead>
          <TableHead className="text-right tabular-nums">
            {t("driverUnpaidAmount", locale)}
          </TableHead>
          <TableHead>{t("driverRating", locale)}</TableHead>
          <TableHead>{t("userStatus", locale)}</TableHead>
          <TableHead className="text-right">{t("actions", locale)}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {drivers.map((driver) => {
          const stats = driver.driverStats;
          const busy = pendingDriverId === driver.id;
          const unpaid = stats?.unpaidAmount ?? 0;

          return (
            <TableRow key={driver.id}>
              <TableCell>
                <div className="min-w-0">
                  <p className="font-medium text-brand-charcoal">
                    {driver.fullName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground md:hidden">
                    {driver.email}
                  </p>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="min-w-0 space-y-0.5 text-sm">
                  <p className="truncate">{driver.email}</p>
                  <p className="text-muted-foreground">{driver.phone}</p>
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {driver.commissionPercent != null
                  ? `${driver.commissionPercent} %`
                  : "—"}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums sm:table-cell">
                {stats?.completedDeliveries ?? 0}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums sm:table-cell">
                {stats?.cancelledDeliveries ?? 0}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatPriceDh(stats?.totalEarned ?? 0)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right tabular-nums",
                  unpaid > 0 && "font-semibold text-red-700",
                )}
              >
                {formatPriceDh(unpaid)}
              </TableCell>
              <TableCell>
                <StarScore
                  value={stats?.averageDriverRating}
                  count={stats?.ratingsCount}
                />
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn(
                    driver.isBlocked
                      ? "bg-red-100 text-red-800"
                      : "bg-brand-green-100 text-brand-green-800",
                  )}
                >
                  {driver.isBlocked
                    ? t("userStatusBlocked", locale)
                    : t("userStatusActive", locale)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t("actions", locale)}
                      >
                        <MoreHorizontal />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(driver)}>
                      <Truck className="size-4" />
                      {t("driverViewDetails", locale)}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditCommission(driver)}>
                      <Pencil className="size-4" />
                      {t("driverEditCommission", locale)}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {driver.isBlocked ? (
                      <DropdownMenuItem
                        disabled={busy}
                        onClick={() => onUnblock(driver)}
                      >
                        <CheckCircle2 className="size-4" />
                        {busy ? t("loading", locale) : t("userUnblock", locale)}
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={busy}
                        onClick={() => onBlock(driver)}
                      >
                        <Ban className="size-4" />
                        {busy ? t("loading", locale) : t("userBlock", locale)}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
