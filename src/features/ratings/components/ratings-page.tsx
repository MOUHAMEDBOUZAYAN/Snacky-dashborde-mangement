"use client";

import { useMemo, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDriversListQuery } from "@/features/drivers/hooks";
import { t, tReplace } from "@/lib/i18n";

import { useRatingsListQuery } from "../hooks";
import { RatingsTable, RatingsTableSkeleton } from "./ratings-table";

const PAGE_SIZE = 20;
const ALL_DRIVERS = "ALL";

function dateInputToIsoStart(value: string): string {
  return new Date(`${value}T00:00:00`).toISOString();
}

function dateInputToIsoEnd(value: string): string {
  return new Date(`${value}T23:59:59.999`).toISOString();
}

export function RatingsPageView() {
  const { locale } = useAuth();
  const [driverId, setDriverId] = useState(ALL_DRIVERS);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const fromIso = dateFrom ? dateInputToIsoStart(dateFrom) : "";
  const toIso = dateTo ? dateInputToIsoEnd(dateTo) : "";

  const driversQuery = useDriversListQuery({
    search: "",
    page: 1,
    pageSize: 100,
  });

  const listQuery = useRatingsListQuery({
    driverId: driverId === ALL_DRIVERS ? "" : driverId,
    from: fromIso,
    to: toIso,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = useMemo(() => {
    const total = listQuery.data?.total ?? 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [listQuery.data?.total]);

  const drivers = driversQuery.data?.items ?? [];
  const ratings = listQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-brand-charcoal">
          {t("ratingsTitle", locale)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("ratingsSubtitle", locale)}
        </p>
      </div>

      <Card className="border-brand-orange-100/80">
        <CardHeader className="flex flex-col gap-4 space-y-0">
          <div>
            <CardTitle>{t("ratings", locale)}</CardTitle>
            <CardDescription>{t("ratingsSubtitle", locale)}</CardDescription>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label className="text-xs">{t("ratingsFilterDriver", locale)}</Label>
              <Select
                value={driverId}
                onValueChange={(value) => {
                  setDriverId(value ?? ALL_DRIVERS);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_DRIVERS}>
                    {t("ratingsAllDrivers", locale)}
                  </SelectItem>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ratings-from" className="text-xs">
                {t("driverStatementFrom", locale)}
              </Label>
              <Input
                id="ratings-from"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="h-9 w-40"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ratings-to" className="text-xs">
                {t("driverStatementTo", locale)}
              </Label>
              <Input
                id="ratings-to"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="h-9 w-40"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {listQuery.isLoading ? (
            <RatingsTableSkeleton />
          ) : listQuery.isError ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-sm text-destructive">
              {listQuery.error instanceof Error
                ? listQuery.error.message
                : t("loading", locale)}
            </p>
          ) : (
            <RatingsTable ratings={ratings} />
          )}

          {totalPages > 1 ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {tReplace("pageOf", { page, total: totalPages }, locale)}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || listQuery.isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {t("previous", locale)}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || listQuery.isFetching}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  {t("next", locale)}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
