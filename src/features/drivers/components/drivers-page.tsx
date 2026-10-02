"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Plus } from "lucide-react";

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
import { t, tReplace } from "@/lib/i18n";

import {
  useDriversListQuery,
  useUnblockDriverMutation,
} from "../hooks";
import type { Driver } from "../types";
import { BlockDriverDialog } from "./block-driver-dialog";
import { CreateDriverDialog } from "./create-driver-dialog";
import { DriverDetailSheet } from "./driver-detail-sheet";
import { DriversTable, DriversTableSkeleton } from "./drivers-table";
import { EditCommissionDialog } from "./edit-commission-dialog";

const PAGE_SIZE = 20;

export function DriversPageView() {
  const { locale } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [pageBySearch, setPageBySearch] = useState<Record<string, number>>({});
  const page = pageBySearch[deferredSearch] ?? 1;

  const [createOpen, setCreateOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [blockDriver, setBlockDriver] = useState<Driver | null>(null);
  const [detailDriver, setDetailDriver] = useState<Driver | null>(null);

  const listQuery = useDriversListQuery({
    search: deferredSearch,
    page,
    pageSize: PAGE_SIZE,
  });
  const unblockMutation = useUnblockDriverMutation();

  const totalPages = useMemo(() => {
    const total = listQuery.data?.total ?? 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [listQuery.data?.total]);

  const drivers = listQuery.data?.items ?? [];

  function setPage(next: number | ((current: number) => number)) {
    setPageBySearch((prev) => {
      const current = prev[deferredSearch] ?? 1;
      const value = typeof next === "function" ? next(current) : next;
      return { ...prev, [deferredSearch]: value };
    });
  }

  async function handleUnblock(driver: Driver) {
    try {
      await unblockMutation.mutateAsync(driver.id);
    } catch {
      // toast in mutation
    }
  }

  const pendingDriverId = unblockMutation.isPending
    ? (unblockMutation.variables ?? null)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-brand-charcoal">
            {t("driversTitle", locale)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("driversSubtitle", locale)}
          </p>
        </div>
        <Button
          type="button"
          className="gap-1.5 bg-brand-orange hover:bg-brand-orange-600"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" />
          {t("driverAdd", locale)}
        </Button>
      </div>

      <Card className="border-brand-orange-100/80">
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("drivers", locale)}</CardTitle>
            <CardDescription>{t("driversSubtitle", locale)}</CardDescription>
          </div>
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t("driversSearchPlaceholder", locale)}
            className="sm:w-72"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {listQuery.isLoading ? (
            <DriversTableSkeleton />
          ) : listQuery.isError ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-sm text-destructive">
              {listQuery.error instanceof Error
                ? listQuery.error.message
                : t("loading", locale)}
            </p>
          ) : (
            <DriversTable
              drivers={drivers}
              pendingDriverId={pendingDriverId}
              onViewDetails={setDetailDriver}
              onEditCommission={setEditDriver}
              onBlock={setBlockDriver}
              onUnblock={handleUnblock}
            />
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

      <CreateDriverDialog open={createOpen} onOpenChange={setCreateOpen} />

      <EditCommissionDialog
        open={Boolean(editDriver)}
        onOpenChange={(open) => {
          if (!open) setEditDriver(null);
        }}
        driver={editDriver}
      />

      <BlockDriverDialog
        open={Boolean(blockDriver)}
        onOpenChange={(open) => {
          if (!open) setBlockDriver(null);
        }}
        driver={blockDriver}
      />

      <DriverDetailSheet
        driver={detailDriver}
        open={Boolean(detailDriver)}
        onOpenChange={(open) => {
          if (!open) setDetailDriver(null);
        }}
      />
    </div>
  );
}
