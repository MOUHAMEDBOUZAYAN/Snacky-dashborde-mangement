"use client";

import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPriceDh } from "@/lib/format";
import { t, type MessageKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import type { OverviewStats } from "../types";

const cards: {
  key: keyof Pick<
    OverviewStats,
    | "ordersTodayCount"
    | "pendingOrdersCount"
    | "completedTodayCount"
    | "revenueToday"
  >;
  labelKey: MessageKey;
  icon: LucideIcon;
  accent: string;
  format: "number" | "money";
}[] = [
  {
    key: "ordersTodayCount",
    labelKey: "kpiOrdersToday",
    icon: ClipboardList,
    accent: "bg-brand-orange-50 text-brand-orange-700 ring-brand-orange-200",
    format: "number",
  },
  {
    key: "pendingOrdersCount",
    labelKey: "kpiPending",
    icon: Clock3,
    accent: "bg-amber-50 text-amber-800 ring-amber-200",
    format: "number",
  },
  {
    key: "completedTodayCount",
    labelKey: "kpiCompletedToday",
    icon: CheckCircle2,
    accent: "bg-sky-50 text-sky-800 ring-sky-200",
    format: "number",
  },
  {
    key: "revenueToday",
    labelKey: "kpiRevenueToday",
    icon: Wallet,
    accent: "bg-brand-green-50 text-brand-green-800 ring-brand-green-200",
    format: "money",
  },
];

export function KpiCardsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

export function KpiCards({ stats }: { stats: OverviewStats }) {
  const { locale } = useAuth();

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const raw = stats[card.key];
        const value =
          card.format === "money" ? formatPriceDh(raw) : String(raw);

        return (
          <Card
            key={card.key}
            className="overflow-hidden border-brand-orange-100/80"
          >
            <CardContent className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0 space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t(card.labelKey, locale)}
                </p>
                <p className="truncate text-2xl font-semibold tracking-tight text-brand-charcoal tabular-nums">
                  {value}
                </p>
              </div>
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1",
                  card.accent,
                )}
              >
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
