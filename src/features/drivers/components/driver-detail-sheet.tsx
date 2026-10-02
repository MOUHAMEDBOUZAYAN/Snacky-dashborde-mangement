"use client";

import { useMemo, useState } from "react";
import { Download, Wallet } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchDriverStatement } from "@/features/drivers/api";
import { formatDateTimeFr, formatPriceDh, shortId } from "@/lib/format";
import { t, tReplace } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { formatStarScore } from "@/components/ui/star-score";

import {
  useDriverStatementQuery,
  useDriverStatsQuery,
} from "../hooks";
import { generateDriverStatementPdf } from "../pdf";
import type { Driver } from "../types";
import { PayoutDriverDialog } from "./payout-driver-dialog";

const STATEMENT_PAGE_SIZE = 20;

function dateInputToIsoStart(value: string): string {
  return new Date(`${value}T00:00:00`).toISOString();
}

function dateInputToIsoEnd(value: string): string {
  return new Date(`${value}T23:59:59.999`).toISOString();
}

interface DriverDetailSheetProps {
  driver: Driver | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DriverDetailSheet({
  driver,
  open,
  onOpenChange,
}: DriverDetailSheetProps) {
  const { locale } = useAuth();
  const [unpaidOnly, setUnpaidOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statementPage, setStatementPage] = useState(1);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const fromIso = dateFrom ? dateInputToIsoStart(dateFrom) : "";
  const toIso = dateTo ? dateInputToIsoEnd(dateTo) : "";

  const statsQuery = useDriverStatsQuery(open ? driver?.id ?? null : null);
  const statementQuery = useDriverStatementQuery(open ? driver?.id ?? null : null, {
    unpaidOnly,
    from: fromIso,
    to: toIso,
    page: statementPage,
    pageSize: STATEMENT_PAGE_SIZE,
  });

  const stats = statsQuery.data ?? driver?.driverStats;
  const statementItems = statementQuery.data?.items ?? [];
  const statementTotal = statementQuery.data?.total ?? 0;
  const statementPages = Math.max(
    1,
    Math.ceil(statementTotal / STATEMENT_PAGE_SIZE),
  );

  const unpaidAmount = stats?.unpaidAmount ?? 0;

  const statCards = useMemo(
    () => [
      {
        label: t("driverCompletedDeliveries", locale),
        value: String(stats?.completedDeliveries ?? 0),
        className: "text-brand-charcoal",
      },
      {
        label: t("driverCancelledDeliveries", locale),
        value: String(stats?.cancelledDeliveries ?? 0),
        className: "text-muted-foreground",
      },
      {
        label: t("driverTotalEarned", locale),
        value: formatPriceDh(stats?.totalEarned ?? 0),
        className: "text-brand-charcoal",
      },
      {
        label: t("driverUnpaidAmount", locale),
        value: formatPriceDh(unpaidAmount),
        className: unpaidAmount > 0 ? "text-red-700" : "text-brand-charcoal",
      },
      {
        label: t("driverPaidAmount", locale),
        value: formatPriceDh(stats?.paidAmount ?? 0),
        className: "text-brand-green-700",
      },
      {
        label: t("driverRating", locale),
        value: formatStarScore(stats?.averageDriverRating)
          ? `${formatStarScore(stats?.averageDriverRating)} (${stats?.ratingsCount ?? 0})`
          : "—",
        className: "text-amber-800",
      },
    ],
    [stats, unpaidAmount, locale],
  );

  async function handleDownloadPdf() {
    if (!driver || !stats) return;
    setPdfLoading(true);
    try {
      const all = await fetchDriverStatement(driver.id, {
        unpaidOnly,
        from: fromIso || undefined,
        to: toIso || undefined,
        limit: 200,
        offset: 0,
      });
      await generateDriverStatementPdf({
        driver,
        stats,
        items: all.items,
        locale,
        dateFrom: fromIso || undefined,
        dateTo: toIso || undefined,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setUnpaidOnly(false);
            setDateFrom("");
            setDateTo("");
            setStatementPage(1);
          }
          onOpenChange(next);
        }}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-2xl"
        >
          <SheetHeader>
            <SheetTitle>{t("driverDetail", locale)}</SheetTitle>
            <SheetDescription>
              {driver?.fullName ?? t("loading", locale)}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-6 px-1 pb-6">
            {driver ? (
              <>
                <div className="rounded-xl border border-brand-orange-100 bg-brand-orange-50/40 px-3 py-3 text-sm">
                  <p className="font-semibold text-brand-charcoal">
                    {driver.fullName}
                  </p>
                  <p className="text-muted-foreground">{driver.email}</p>
                  <p className="text-muted-foreground">{driver.phone}</p>
                  <p className="mt-1 tabular-nums">
                    {t("driverCommission", locale)}:{" "}
                    {driver.commissionPercent != null
                      ? `${driver.commissionPercent} %`
                      : "—"}
                  </p>
                </div>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-brand-charcoal">
                    {t("driverStats", locale)}
                  </h3>
                  {statsQuery.isLoading && !stats ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {statCards.map((card) => (
                        <div
                          key={card.label}
                          className="rounded-xl border border-border bg-white px-3 py-3"
                        >
                          <p className="text-xs text-muted-foreground">
                            {card.label}
                          </p>
                          <p
                            className={cn(
                              "mt-1 text-lg font-semibold tabular-nums",
                              card.className,
                            )}
                          >
                            {card.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-brand-charcoal">
                      {t("driverStatement", locale)}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={pdfLoading || !stats}
                        className="gap-1.5"
                        onClick={handleDownloadPdf}
                      >
                        <Download className="size-3.5" />
                        {pdfLoading
                          ? t("loading", locale)
                          : t("driverDownloadPdf", locale)}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={unpaidAmount <= 0}
                        className="gap-1.5 bg-brand-green-600 hover:bg-brand-green-700"
                        onClick={() => setPayoutOpen(true)}
                      >
                        <Wallet className="size-3.5" />
                        {t("driverMarkPaid", locale)}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-muted/30 px-3 py-3">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={unpaidOnly}
                        onCheckedChange={(checked) => {
                          setUnpaidOnly(Boolean(checked));
                          setStatementPage(1);
                        }}
                      />
                      {t("driverStatementUnpaidOnly", locale)}
                    </label>
                    <div className="space-y-1">
                      <Label htmlFor="stmt-from" className="text-xs">
                        {t("driverStatementFrom", locale)}
                      </Label>
                      <Input
                        id="stmt-from"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                          setDateFrom(e.target.value);
                          setStatementPage(1);
                        }}
                        className="h-8 w-36"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="stmt-to" className="text-xs">
                        {t("driverStatementTo", locale)}
                      </Label>
                      <Input
                        id="stmt-to"
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                          setDateTo(e.target.value);
                          setStatementPage(1);
                        }}
                        className="h-8 w-36"
                      />
                    </div>
                  </div>

                  {statementQuery.isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : statementItems.length === 0 ? (
                    <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                      {t("driversEmpty", locale)}
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("driverStatementOrderId", locale)}</TableHead>
                          <TableHead>{t("driverStatementDate", locale)}</TableHead>
                          <TableHead className="text-right">
                            {t("driverStatementOrderTotal", locale)}
                          </TableHead>
                          <TableHead className="hidden text-right sm:table-cell">
                            {t("driverStatementCommissionPercent", locale)}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("driverStatementCommissionAmount", locale)}
                          </TableHead>
                          <TableHead>{t("driverStatementPaidStatus", locale)}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {statementItems.map((item) => (
                          <TableRow key={item.orderId}>
                            <TableCell className="font-mono text-xs">
                              {shortId(item.orderId, 10)}
                            </TableCell>
                            <TableCell className="tabular-nums text-sm">
                              {formatDateTimeFr(item.completedAt)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatPriceDh(item.orderTotal)}
                            </TableCell>
                            <TableCell className="hidden text-right tabular-nums sm:table-cell">
                              {item.commissionPercent} %
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatPriceDh(item.commissionAmount)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  item.paidOut
                                    ? "bg-brand-green-100 text-brand-green-800"
                                    : "bg-amber-100 text-amber-900",
                                )}
                              >
                                {item.paidOut
                                  ? t("driverStatementPaid", locale)
                                  : t("driverStatementUnpaid", locale)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {statementPages > 1 ? (
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-muted-foreground">
                        {tReplace(
                          "pageOf",
                          { page: statementPage, total: statementPages },
                          locale,
                        )}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            statementPage <= 1 || statementQuery.isFetching
                          }
                          onClick={() =>
                            setStatementPage((p) => Math.max(1, p - 1))
                          }
                        >
                          {t("previous", locale)}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            statementPage >= statementPages ||
                            statementQuery.isFetching
                          }
                          onClick={() =>
                            setStatementPage((p) =>
                              Math.min(statementPages, p + 1),
                            )
                          }
                        >
                          {t("next", locale)}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </section>
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <PayoutDriverDialog
        open={payoutOpen}
        onOpenChange={setPayoutOpen}
        driver={driver}
        unpaidAmount={unpaidAmount}
        onSuccess={() => {
          statsQuery.refetch();
          statementQuery.refetch();
        }}
      />
    </>
  );
}
