"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  Star,
  Truck,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { Suspense, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { usePendingOrdersCountQuery } from "@/features/orders/hooks";
import { ORDER_STATUSES, type OrderStatus } from "@/features/orders/types";
import { cn } from "@/lib/utils";
import { t, type MessageKey } from "@/lib/i18n";

type NavChild = {
  href: string;
  labelKey: MessageKey;
  matchStatus?: OrderStatus | "ALL";
  showPendingBadge?: boolean;
};

type NavLinkItem = {
  type: "link";
  href: string;
  labelKey: MessageKey;
  icon: LucideIcon;
};

type NavGroupItem = {
  type: "group";
  id: string;
  labelKey: MessageKey;
  icon: LucideIcon;
  matchPrefix: string;
  children: NavChild[];
};

type NavItem = NavLinkItem | NavGroupItem;

const navItems: NavItem[] = [
  {
    type: "link",
    href: "/dashboard",
    labelKey: "overview",
    icon: LayoutDashboard,
  },
  {
    type: "group",
    id: "menu",
    labelKey: "menu",
    icon: UtensilsCrossed,
    matchPrefix: "/dashboard/menu",
    children: [
      {
        href: "/dashboard/menu/categories",
        labelKey: "categories",
      },
      {
        href: "/dashboard/menu/articles",
        labelKey: "menuItems",
      },
    ],
  },
  {
    type: "group",
    id: "orders",
    labelKey: "orders",
    icon: ClipboardList,
    matchPrefix: "/dashboard/orders",
    children: [
      {
        href: "/dashboard/orders",
        labelKey: "filterAllStatuses",
        matchStatus: "ALL",
      },
      {
        href: "/dashboard/orders?status=PENDING",
        labelKey: "orderStatusPENDING",
        matchStatus: "PENDING",
        showPendingBadge: true,
      },
      {
        href: "/dashboard/orders?status=PREPARING",
        labelKey: "orderStatusPREPARING",
        matchStatus: "PREPARING",
      },
      {
        href: "/dashboard/orders?status=READY",
        labelKey: "ordersNavReady",
        matchStatus: "READY",
      },
      {
        href: "/dashboard/orders?status=OUT_FOR_DELIVERY",
        labelKey: "orderStatusOUT_FOR_DELIVERY",
        matchStatus: "OUT_FOR_DELIVERY",
      },
      {
        href: "/dashboard/orders?status=COMPLETED",
        labelKey: "orderStatusCOMPLETED",
        matchStatus: "COMPLETED",
      },
      {
        href: "/dashboard/orders?status=CANCELLED",
        labelKey: "orderStatusCANCELLED",
        matchStatus: "CANCELLED",
      },
    ],
  },
  {
    type: "link",
    href: "/dashboard/livreurs",
    labelKey: "drivers",
    icon: Truck,
  },
  {
    type: "link",
    href: "/dashboard/avis",
    labelKey: "ratings",
    icon: Star,
  },
  {
    type: "link",
    href: "/dashboard/users",
    labelKey: "users",
    icon: Users,
  },
];

function parseStatusParam(value: string | null): OrderStatus | "ALL" {
  if (!value) return "ALL";
  return (ORDER_STATUSES as readonly string[]).includes(value)
    ? (value as OrderStatus)
    : "ALL";
}

function isLinkActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isPathUnder(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isOrdersChildActive(
  pathname: string,
  statusParam: OrderStatus | "ALL",
  child: NavChild,
): boolean {
  if (!isPathUnder(pathname, "/dashboard/orders")) return false;
  if (pathname !== "/dashboard/orders") return false;
  const expected = child.matchStatus ?? "ALL";
  return statusParam === expected;
}

function isMenuChildActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function linkClassName(active: boolean): string {
  return cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    active
      ? "bg-brand-orange-50 text-brand-orange-700 ring-1 ring-brand-orange-200"
      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
  );
}

function childLinkClassName(active: boolean): string {
  return cn(
    "flex items-center justify-between gap-2 rounded-lg py-2 pr-3 pl-9 text-sm font-medium transition-colors",
    active
      ? "bg-brand-orange-50 text-brand-orange-700 ring-1 ring-brand-orange-200"
      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
  );
}

function SidebarNav({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useAuth();
  const statusParam = parseStatusParam(searchParams.get("status"));
  const pendingQuery = usePendingOrdersCountQuery();
  const pendingCount = pendingQuery.data ?? 0;

  const [userExpanded, setUserExpanded] = useState<Record<string, boolean>>({});

  function toggleGroup(id: string, groupActive: boolean) {
    if (groupActive) return;
    setUserExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      {navItems.map((item) => {
        if (item.type === "link") {
          const active = isLinkActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={linkClassName(active)}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  active ? "text-brand-orange-600" : undefined,
                )}
              />
              {t(item.labelKey, locale)}
            </Link>
          );
        }

        const groupActive = isPathUnder(pathname, item.matchPrefix);
        const open = groupActive || Boolean(userExpanded[item.id]);
        const Icon = item.icon;

        return (
          <div key={item.id} className="space-y-0.5">
            <button
              type="button"
              onClick={() => toggleGroup(item.id, groupActive)}
              aria-expanded={open}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                groupActive
                  ? "text-brand-orange-700"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  groupActive ? "text-brand-orange-600" : undefined,
                )}
              />
              <span className="flex-1">{t(item.labelKey, locale)}</span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 transition-transform",
                  open ? "rotate-0" : "-rotate-90",
                )}
              />
            </button>

            {open ? (
              <div className="space-y-0.5">
                {item.children.map((child) => {
                  const active =
                    item.id === "orders"
                      ? isOrdersChildActive(pathname, statusParam, child)
                      : isMenuChildActive(pathname, child.href);

                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onNavigate}
                      className={childLinkClassName(active)}
                    >
                      <span className="truncate">
                        {t(child.labelKey, locale)}
                      </span>
                      {child.showPendingBadge && pendingCount > 0 ? (
                        <Badge
                          variant="secondary"
                          className="h-5 min-w-5 justify-center bg-brand-orange-100 px-1.5 text-[11px] text-brand-orange-800"
                        >
                          {pendingCount > 99 ? "99+" : pendingCount}
                        </Badge>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const { locale } = useAuth();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="relative size-10 shrink-0 overflow-hidden">
          <Image
            src="/logo/image.png"
            alt={t("brandName", locale)}
            fill
            sizes="40px"
            className="object-contain"
            priority
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight text-brand-charcoal">
            {t("appName", locale)}
          </p>
          <p className="text-xs font-medium text-brand-green-700">
            {t("appTagline", locale)}
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-1 flex-col gap-2 p-3">
            <div className="h-10 rounded-lg bg-muted/60" />
            <div className="h-10 rounded-lg bg-muted/60" />
            <div className="h-10 rounded-lg bg-muted/60" />
          </div>
        }
      >
        <SidebarNav onNavigate={onNavigate} />
      </Suspense>
    </aside>
  );
}
