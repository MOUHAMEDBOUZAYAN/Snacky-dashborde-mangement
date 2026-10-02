"use client";

import { Suspense, useDeferredValue, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { t, tReplace } from "@/lib/i18n";

import { useOrdersListQuery } from "../hooks";
import { orderStatusLabel } from "../labels";
import { ORDER_STATUSES, type OrderStatus } from "../types";
import { OrderDetailSheet } from "./order-detail-sheet";
import { OrdersTable, OrdersTableSkeleton } from "./orders-table";

const PAGE_SIZE = 20;

function parseStatusParam(value: string | null): OrderStatus | "ALL" {
  if (!value) return "ALL";
  return (ORDER_STATUSES as readonly string[]).includes(value)
    ? (value as OrderStatus)
    : "ALL";
}

function OrdersPageContent() {
  const { locale } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = parseStatusParam(searchParams.get("status"));

  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());

  const [pageByKey, setPageByKey] = useState<Record<string, number>>({});
  const pageKey = `${status}:${deferredSearch}`;
  const page = pageByKey[pageKey] ?? 1;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const listQuery = useOrdersListQuery({
    status,
    search: deferredSearch,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = useMemo(() => {
    const total = listQuery.data?.total ?? 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [listQuery.data?.total]);

  function setPage(next: number | ((current: number) => number)) {
    setPageByKey((prev) => {
      const current = prev[pageKey] ?? 1;
      const value = typeof next === "function" ? next(current) : next;
      return { ...prev, [pageKey]: value };
    });
  }

  function setStatus(next: OrderStatus | "ALL") {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "ALL") {
      params.delete("status");
    } else {
      params.set("status", next);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-brand-charcoal">
          {t("ordersTitle", locale)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("ordersSubtitle", locale)}
        </p>
      </div>

      <Card className="border-brand-orange-100/80">
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("orders", locale)}</CardTitle>
            <CardDescription>{t("ordersSubtitle", locale)}</CardDescription>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Input
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
              }}
              placeholder={t("ordersSearchPlaceholder", locale)}
              className="sm:w-64"
            />
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus((value as OrderStatus | "ALL") || "ALL");
              }}
            >
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  {t("filterAllStatuses", locale)}
                </SelectItem>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {orderStatusLabel(s, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {listQuery.isLoading ? (
            <OrdersTableSkeleton />
          ) : listQuery.isError ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-sm text-destructive">
              {listQuery.error instanceof Error
                ? listQuery.error.message
                : t("loading", locale)}
            </p>
          ) : (
            <OrdersTable
              orders={listQuery.data?.items ?? []}
              onSelect={setSelectedId}
            />
          )}

          {totalPages > 1 ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {tReplace(
                  "pageOf",
                  { page, total: totalPages },
                  locale,
                )}
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

      <OrderDetailSheet
        orderId={selectedId}
        open={Boolean(selectedId)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </div>
  );
}

export function OrdersPageView() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <OrdersTableSkeleton />
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}
