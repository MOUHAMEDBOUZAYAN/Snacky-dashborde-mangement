import {
  formatWeekdayFr,
  isSameLocalDay,
  startOfLocalDay,
  startOfLocalDayOffset,
} from "@/lib/format";

import type { Order, OrdersChartPoint, OrdersChartRange, OverviewStats } from "./types";

export function chartRangeDayCount(range: OrdersChartRange): number {
  switch (range) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
  }
}

function formatDayMonth(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function startOfLocalWeek(date: Date): Date {
  const d = startOfLocalDay(date);
  const day = d.getDay(); // 0 Sun … 6 Sat
  const diff = day === 0 ? 6 : day - 1; // Monday start
  d.setDate(d.getDate() - diff);
  return d;
}

function isInLocalDayRange(iso: string, start: Date, endExclusive: Date): boolean {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t < endExclusive.getTime();
}

/** Daily series for 7d / 30d ranges. */
function buildDailySeries(
  orders: Order[],
  days: number,
  now: Date,
  labelMode: "weekday" | "dayMonth",
): OrdersChartPoint[] {
  return Array.from({ length: days }, (_, index) => {
    const daysAgo = days - 1 - index;
    const day = startOfLocalDayOffset(daysAgo, now);
    const count = orders.filter((o) => isSameLocalDay(o.createdAt, day)).length;
    return {
      date: day,
      label:
        labelMode === "weekday" ? formatWeekdayFr(day) : formatDayMonth(day),
      count,
    };
  });
}

/** Weekly buckets for the last ~90 days (thinner chart, readable labels). */
function buildWeeklySeries(
  orders: Order[],
  now: Date,
): OrdersChartPoint[] {
  const thisWeekStart = startOfLocalWeek(now);
  const weeks = 13;

  return Array.from({ length: weeks }, (_, index) => {
    const weeksAgo = weeks - 1 - index;
    const weekStart = new Date(thisWeekStart);
    weekStart.setDate(thisWeekStart.getDate() - weeksAgo * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const count = orders.filter((o) =>
      isInLocalDayRange(o.createdAt, weekStart, weekEnd),
    ).length;

    return {
      date: weekStart,
      label: formatDayMonth(weekStart),
      count,
    };
  });
}

export function buildOrdersChartSeries(
  orders: Order[],
  range: OrdersChartRange,
  now = new Date(),
): OrdersChartPoint[] {
  if (range === "7d") {
    return buildDailySeries(orders, 7, now, "weekday");
  }
  if (range === "30d") {
    return buildDailySeries(orders, 30, now, "dayMonth");
  }
  return buildWeeklySeries(orders, now);
}

/**
 * TODO(backend): replace client-side aggregation with GET /stats
 * once the NestJS API exposes a dedicated admin stats endpoint.
 */
export function computeOverviewStats(input: {
  ordersWindow: Order[];
  pendingOrdersCount: number;
  now?: Date;
}): OverviewStats {
  const now = input.now ?? new Date();
  const today = startOfLocalDay(now);

  const todaysOrders = input.ordersWindow.filter((o) =>
    isSameLocalDay(o.createdAt, today),
  );

  const completedToday = todaysOrders.filter((o) => o.status === "COMPLETED");

  const revenueToday = completedToday.reduce(
    (sum, o) => sum + Number(o.total),
    0,
  );

  const recentOrders = [...input.ordersWindow]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 8);

  return {
    ordersTodayCount: todaysOrders.length,
    pendingOrdersCount: input.pendingOrdersCount,
    completedTodayCount: completedToday.length,
    revenueToday,
    recentOrders,
    ordersLast7Days: buildOrdersChartSeries(input.ordersWindow, "7d", now),
  };
}
