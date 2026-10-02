"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { t } from "@/lib/i18n";

import { useOverviewStatsQuery } from "../hooks";
import { KpiCards, KpiCardsSkeleton } from "./kpi-cards";
import { OrdersChartCard, OrdersChartSkeleton } from "./orders-chart";
import { RecentOrdersCard, RecentOrdersSkeleton } from "./recent-orders";

export function OverviewPageView() {
  const { locale } = useAuth();
  const statsQuery = useOverviewStatsQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-brand-charcoal">
          {t("overview", locale)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("overviewSubtitle", locale)}
        </p>
      </div>

      {statsQuery.isLoading ? (
        <>
          <KpiCardsSkeleton />
          <div className="grid gap-4 xl:grid-cols-2">
            <RecentOrdersSkeleton />
            <OrdersChartSkeleton />
          </div>
        </>
      ) : statsQuery.isError ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-sm text-destructive">
          {statsQuery.error instanceof Error
            ? statsQuery.error.message
            : t("loading", locale)}
        </p>
      ) : statsQuery.data ? (
        <>
          <KpiCards stats={statsQuery.data} />
          <div className="grid gap-4 xl:grid-cols-2">
            <RecentOrdersCard orders={statsQuery.data.recentOrders} />
            <OrdersChartCard />
          </div>
        </>
      ) : null}
    </div>
  );
}
