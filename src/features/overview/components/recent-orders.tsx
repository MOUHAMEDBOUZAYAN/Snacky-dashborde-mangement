"use client";

import Link from "next/link";

import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  orderStatusBadgeClass,
  orderStatusLabel,
  orderTypeLabel,
} from "@/features/orders/labels";
import type { Order } from "@/features/orders/types";
import { formatPriceDh, formatTimeFr, shortId } from "@/lib/format";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function RecentOrdersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </CardContent>
    </Card>
  );
}

export function RecentOrdersCard({ orders }: { orders: Order[] }) {
  const { locale } = useAuth();

  return (
    <Card className="border-brand-orange-100/80">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">{t("recentOrders", locale)}</CardTitle>
        <Link
          href="/dashboard/orders"
          className="text-sm font-medium text-brand-orange-700 hover:underline"
        >
          {t("viewAll", locale)}
        </Link>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-brand-orange-200 bg-brand-orange-50/40 px-4 py-8 text-center text-sm text-muted-foreground">
            {t("noRecentOrders", locale)}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("orderId", locale)}</TableHead>
                <TableHead>{t("orderTime", locale)}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t("orderType", locale)}
                </TableHead>
                <TableHead>{t("orderTotal", locale)}</TableHead>
                <TableHead>{t("orderStatus", locale)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    {shortId(order.id)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatTimeFr(order.createdAt)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {orderTypeLabel(order.type, locale)}
                  </TableCell>
                  <TableCell className="font-medium tabular-nums">
                    {formatPriceDh(order.total)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(orderStatusBadgeClass(order.status))}
                    >
                      {orderStatusLabel(order.status, locale)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
