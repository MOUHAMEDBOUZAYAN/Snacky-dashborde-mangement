"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAuth } from "@/components/providers/auth-provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { t, type MessageKey } from "@/lib/i18n";

import { useOrdersChartQuery } from "../hooks";
import type { OrdersChartRange } from "../types";

const RANGES: { value: OrdersChartRange; labelKey: MessageKey }[] = [
  { value: "7d", labelKey: "chartRange7d" },
  { value: "30d", labelKey: "chartRange30d" },
  { value: "90d", labelKey: "chartRange90d" },
];

function barMaxSize(range: OrdersChartRange): number {
  if (range === "7d") return 28;
  if (range === "30d") return 8;
  return 18;
}

function titleKey(range: OrdersChartRange): MessageKey {
  if (range === "30d") return "ordersLast30Days";
  if (range === "90d") return "ordersLast90Days";
  return "ordersLast7Days";
}

export function OrdersChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-52" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-48 w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

export function OrdersChartCard() {
  const { locale } = useAuth();
  const [range, setRange] = useState<OrdersChartRange>("7d");
  const chartQuery = useOrdersChartQuery(range);

  const data = (chartQuery.data ?? []).map((d) => ({
    label: d.label,
    count: d.count,
  }));

  const dense = range === "30d";

  return (
    <Card className="border-brand-orange-100/80">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">
          {t(titleKey(range), locale)}
        </CardTitle>
        <Select
          value={range}
          onValueChange={(value) => {
            if (value === "7d" || value === "30d" || value === "90d") {
              setRange(value);
            }
          }}
        >
          <SelectTrigger className="h-8 w-[9.5rem] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.labelKey, locale)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="h-52">
        {chartQuery.isLoading && !chartQuery.data ? (
          <Skeleton className="h-full w-full rounded-xl" />
        ) : chartQuery.isError ? (
          <p className="flex h-full items-center justify-center text-sm text-destructive">
            {chartQuery.error instanceof Error
              ? chartQuery.error.message
              : t("loading", locale)}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: -16, bottom: dense ? 8 : 0 }}
              barCategoryGap={range === "7d" ? "28%" : range === "30d" ? "18%" : "22%"}
              maxBarSize={barMaxSize(range)}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#fed7aa"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={dense ? 4 : 0}
                angle={dense ? -35 : 0}
                textAnchor={dense ? "end" : "middle"}
                height={dense ? 42 : 28}
                tick={{ fill: "#78716c", fontSize: dense ? 10 : 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#78716c", fontSize: 12 }}
                width={32}
              />
              <Tooltip
                cursor={{ fill: "rgba(249, 115, 22, 0.08)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #fed7aa",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="count"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
                maxBarSize={barMaxSize(range)}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
