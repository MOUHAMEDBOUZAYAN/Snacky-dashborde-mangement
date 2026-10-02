"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { StarScore } from "@/components/ui/star-score";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTimeFr, shortId } from "@/lib/format";
import { t } from "@/lib/i18n";

import type { AdminRating } from "../types";

export function RatingsTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

interface RatingsTableProps {
  ratings: AdminRating[];
}

export function RatingsTable({ ratings }: RatingsTableProps) {
  const { locale } = useAuth();

  if (ratings.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-brand-orange-200 bg-brand-orange-50/40 px-4 py-10 text-center text-sm text-muted-foreground">
        {t("ratingsEmpty", locale)}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("ratingsOrderId", locale)}</TableHead>
          <TableHead>{t("ratingsDate", locale)}</TableHead>
          <TableHead>{t("orderCustomer", locale)}</TableHead>
          <TableHead>{t("ratingsService", locale)}</TableHead>
          <TableHead>{t("ratingsDriver", locale)}</TableHead>
          <TableHead>{t("ratingsComments", locale)}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ratings.map((rating) => (
          <TableRow key={rating.id}>
            <TableCell className="font-mono text-xs">
              {shortId(rating.orderId, 10)}
            </TableCell>
            <TableCell className="whitespace-nowrap tabular-nums text-sm">
              {formatDateTimeFr(rating.createdAt)}
            </TableCell>
            <TableCell className="font-medium text-brand-charcoal">
              {rating.customerName}
            </TableCell>
            <TableCell>
              <StarScore value={rating.serviceRating} />
            </TableCell>
            <TableCell>
              <div className="space-y-0.5">
                <StarScore value={rating.driverRating} />
                {rating.driverName ? (
                  <p className="text-xs text-muted-foreground">
                    {rating.driverName}
                  </p>
                ) : null}
              </div>
            </TableCell>
            <TableCell className="max-w-xs text-sm">
              {rating.serviceComment || rating.driverComment ? (
                <div className="space-y-1">
                  {rating.serviceComment ? (
                    <p>
                      <span className="text-muted-foreground">
                        {t("ratingsService", locale)}:{" "}
                      </span>
                      {rating.serviceComment}
                    </p>
                  ) : null}
                  {rating.driverComment ? (
                    <p>
                      <span className="text-muted-foreground">
                        {t("ratingsDriver", locale)}:{" "}
                      </span>
                      {rating.driverComment}
                    </p>
                  ) : null}
                </div>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
