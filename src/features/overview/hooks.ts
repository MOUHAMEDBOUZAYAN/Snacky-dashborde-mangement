"use client";

import { useQuery } from "@tanstack/react-query";

import { startOfLocalDayOffset } from "@/lib/format";

import { fetchOrdersUntil, fetchPendingOrdersCount } from "./api";
import {
  buildOrdersChartSeries,
  chartRangeDayCount,
  computeOverviewStats,
} from "./stats";
import type { OrdersChartRange } from "./types";

export const overviewKeys = {
  all: ["overview"] as const,
  stats: () => [...overviewKeys.all, "stats"] as const,
  chart: (range: OrdersChartRange) =>
    [...overviewKeys.all, "chart", range] as const,
};

const REFETCH_MS = 30_000;

export function useOverviewStatsQuery() {
  return useQuery({
    queryKey: overviewKeys.stats(),
    queryFn: async () => {
      const windowStart = startOfLocalDayOffset(6);
      const [ordersWindow, pendingOrdersCount] = await Promise.all([
        fetchOrdersUntil(windowStart),
        fetchPendingOrdersCount(),
      ]);

      return computeOverviewStats({
        ordersWindow,
        pendingOrdersCount,
      });
    },
    refetchInterval: REFETCH_MS,
  });
}

export function useOrdersChartQuery(range: OrdersChartRange) {
  const days = chartRangeDayCount(range);

  return useQuery({
    queryKey: overviewKeys.chart(range),
    queryFn: async () => {
      const windowStart = startOfLocalDayOffset(days - 1);
      // Longer windows may need more pages.
      const maxPages = range === "7d" ? 10 : range === "30d" ? 20 : 40;
      const orders = await fetchOrdersUntil(windowStart, maxPages);
      return buildOrdersChartSeries(orders, range);
    },
    refetchInterval: REFETCH_MS,
    placeholderData: (previous) => previous,
  });
}
