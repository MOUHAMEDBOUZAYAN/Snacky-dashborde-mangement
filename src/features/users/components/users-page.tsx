"use client";

import { useDeferredValue, useMemo, useState } from "react";

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

import {
  useUnblockUserMutation,
  useUsersListQuery,
} from "../hooks";
import type { AdminUser, UsersSort } from "../types";
import { BlockUserDialog } from "./block-user-dialog";
import { UsersTable, UsersTableSkeleton } from "./users-table";

const PAGE_SIZE = 20;

function sortUsers(items: AdminUser[], sort: UsersSort): AdminUser[] {
  if (sort === "createdAt") return items;
  const sorted = [...items];
  if (sort === "cancelRate") {
    sorted.sort((a, b) => b.cancelRate - a.cancelRate);
  } else {
    sorted.sort((a, b) => b.cancelledOrders - a.cancelledOrders);
  }
  return sorted;
}

export function UsersPageView() {
  const { locale } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [pageBySearch, setPageBySearch] = useState<Record<string, number>>({});
  const page = pageBySearch[deferredSearch] ?? 1;
  const [sort, setSort] = useState<UsersSort>("cancelRate");
  const [blockingUser, setBlockingUser] = useState<AdminUser | null>(null);

  const listQuery = useUsersListQuery({
    search: deferredSearch,
    page,
    pageSize: PAGE_SIZE,
  });
  const unblockMutation = useUnblockUserMutation();

  const totalPages = useMemo(() => {
    const total = listQuery.data?.total ?? 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [listQuery.data?.total]);

  const users = useMemo(
    () => sortUsers(listQuery.data?.items ?? [], sort),
    [listQuery.data?.items, sort],
  );

  function setPage(next: number | ((current: number) => number)) {
    setPageBySearch((prev) => {
      const current = prev[deferredSearch] ?? 1;
      const value = typeof next === "function" ? next(current) : next;
      return { ...prev, [deferredSearch]: value };
    });
  }

  async function handleUnblock(user: AdminUser) {
    try {
      await unblockMutation.mutateAsync(user.id);
    } catch {
      // toast in mutation
    }
  }

  const pendingUserId = unblockMutation.isPending
    ? (unblockMutation.variables ?? null)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-brand-charcoal">
          {t("usersTitle", locale)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("usersSubtitle", locale)}
        </p>
      </div>

      <Card className="border-brand-orange-100/80">
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("users", locale)}</CardTitle>
            <CardDescription>{t("usersSubtitle", locale)}</CardDescription>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Input
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
              }}
              placeholder={t("usersSearchPlaceholder", locale)}
              className="sm:w-64"
            />
            <Select
              value={sort}
              onValueChange={(value) => {
                setSort((value as UsersSort) || "createdAt");
              }}
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">
                  {t("usersSortCreatedAt", locale)}
                </SelectItem>
                <SelectItem value="cancelRate">
                  {t("usersSortCancelRate", locale)}
                </SelectItem>
                <SelectItem value="cancelledOrders">
                  {t("usersSortCancelled", locale)}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {listQuery.isLoading ? (
            <UsersTableSkeleton />
          ) : listQuery.isError ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-sm text-destructive">
              {listQuery.error instanceof Error
                ? listQuery.error.message
                : t("loading", locale)}
            </p>
          ) : (
            <UsersTable
              users={users}
              pendingUserId={pendingUserId}
              onBlock={setBlockingUser}
              onUnblock={handleUnblock}
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

      <BlockUserDialog
        open={Boolean(blockingUser)}
        onOpenChange={(open) => {
          if (!open) setBlockingUser(null);
        }}
        user={blockingUser}
      />
    </div>
  );
}
