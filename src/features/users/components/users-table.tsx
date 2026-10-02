"use client";

import { AlertTriangle, Ban, CheckCircle2 } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTimeFr } from "@/lib/format";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import {
  cancelRateClassName,
  formatCancelRatePercent,
  isPotentialAbuser,
  type AdminUser,
} from "../types";

export function UsersTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

interface UsersTableProps {
  users: AdminUser[];
  pendingUserId: string | null;
  onBlock: (user: AdminUser) => void;
  onUnblock: (user: AdminUser) => void;
}

export function UsersTable({
  users,
  pendingUserId,
  onBlock,
  onUnblock,
}: UsersTableProps) {
  const { locale } = useAuth();

  if (users.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-brand-orange-200 bg-brand-orange-50/40 px-4 py-10 text-center text-sm text-muted-foreground">
        {t("usersEmpty", locale)}
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
            {t("userTotalOrders", locale)}
          </TableHead>
          <TableHead className="hidden text-right tabular-nums sm:table-cell">
            {t("userCompletedOrders", locale)}
          </TableHead>
          <TableHead className="hidden text-right tabular-nums sm:table-cell">
            {t("userCancelledOrders", locale)}
          </TableHead>
          <TableHead className="text-right tabular-nums">
            {t("userCancelRate", locale)}
          </TableHead>
          <TableHead>{t("userStatus", locale)}</TableHead>
          <TableHead className="hidden lg:table-cell">
            {t("userCreatedAt", locale)}
          </TableHead>
          <TableHead className="text-right">{t("actions", locale)}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const abuser = isPotentialAbuser(user);
          const busy = pendingUserId === user.id;

          return (
            <TableRow
              key={user.id}
              className={cn(
                abuser &&
                  "bg-red-50/70 hover:bg-red-50 dark:bg-red-950/20",
              )}
            >
              <TableCell>
                <div className="flex items-start gap-2">
                  {abuser ? (
                    <AlertTriangle
                      className="mt-0.5 size-4 shrink-0 text-red-600"
                      aria-label={t("userAbuseFlag", locale)}
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="font-medium text-brand-charcoal">
                      {user.fullName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground md:hidden">
                      {user.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="min-w-0 space-y-0.5 text-sm">
                  <p className="truncate">{user.email}</p>
                  <p className="text-muted-foreground">{user.phone}</p>
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {user.totalOrders}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums sm:table-cell">
                {user.completedOrders}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums sm:table-cell">
                {user.cancelledOrders}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right tabular-nums",
                  cancelRateClassName(user.cancelRate),
                )}
              >
                {formatCancelRatePercent(user.cancelRate)}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn(
                    user.isBlocked
                      ? "bg-red-100 text-red-800"
                      : "bg-brand-green-100 text-brand-green-800",
                  )}
                >
                  {user.isBlocked
                    ? t("userStatusBlocked", locale)
                    : t("userStatusActive", locale)}
                </Badge>
              </TableCell>
              <TableCell className="hidden tabular-nums text-muted-foreground lg:table-cell">
                {formatDateTimeFr(user.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                {user.isBlocked ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    className="gap-1.5"
                    onClick={() => onUnblock(user)}
                  >
                    <CheckCircle2 className="size-3.5" />
                    {busy
                      ? t("loading", locale)
                      : t("userUnblock", locale)}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={busy || user.role === "ADMIN"}
                    className="gap-1.5"
                    onClick={() => onBlock(user)}
                  >
                    <Ban className="size-3.5" />
                    {busy ? t("loading", locale) : t("userBlock", locale)}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
