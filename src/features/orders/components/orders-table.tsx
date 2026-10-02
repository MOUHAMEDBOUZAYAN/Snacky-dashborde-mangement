"use client";

import { useState, type MouseEvent } from "react";
import { Printer } from "lucide-react";
import { toast } from "sonner";

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
import { formatPriceDh, formatDateTimeFr, formatTimeFr, shortId } from "@/lib/format";
import { t, tReplace, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { fetchOrder } from "../api";
import {
  orderCustomerLabel,
  orderStatusBadgeClass,
  orderStatusLabel,
  orderTypeBadgeClass,
  orderTypeLabel,
} from "../labels";
import { printOrderTicket } from "../ticket-print";
import type { Order } from "../types";

export function OrdersTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

function typeBadgeLabel(order: Order, locale: Locale): string {
  const typeLabel = orderTypeLabel(order.type, locale);
  if (!order.scheduledFor) return typeLabel;
  return `${typeLabel} · ${formatTimeFr(order.scheduledFor)}`;
}

interface OrdersTableProps {
  orders: Order[];
  onSelect: (orderId: string) => void;
}

export function OrdersTable({ orders, onSelect }: OrdersTableProps) {
  const { locale } = useAuth();
  const [printingOrderId, setPrintingOrderId] = useState<string | null>(null);

  async function handlePrintTicket(event: MouseEvent, orderId: string) {
    event.stopPropagation();
    if (printingOrderId) return;

    setPrintingOrderId(orderId);
    try {
      const fullOrder = await fetchOrder(orderId);
      await printOrderTicket(fullOrder);
    } catch {
      toast.error(t("orderTicketPrintError", locale));
    } finally {
      setPrintingOrderId(null);
    }
  }

  if (orders.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-brand-orange-200 bg-brand-orange-50/40 px-4 py-10 text-center text-sm text-muted-foreground">
        {t("ordersEmpty", locale)}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("orderId", locale)}</TableHead>
          <TableHead>{t("orderTime", locale)}</TableHead>
          <TableHead>{t("orderCustomer", locale)}</TableHead>
          <TableHead>{t("orderType", locale)}</TableHead>
          <TableHead className="hidden md:table-cell">
            {t("orderItems", locale)}
          </TableHead>
          <TableHead>{t("orderTotal", locale)}</TableHead>
          <TableHead>{t("orderStatus", locale)}</TableHead>
          <TableHead className="w-12 text-right">
            <span className="sr-only">{t("actions", locale)}</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const itemCount = order.items.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );
          const customerName = orderCustomerLabel(order.customer, locale);
          const isGuest = !order.customer;
          const isPrinting = printingOrderId === order.id;

          return (
            <TableRow
              key={order.id}
              className="cursor-pointer"
              onClick={() => onSelect(order.id)}
            >
              <TableCell className="font-mono text-xs">
                {shortId(order.id)}
              </TableCell>
              <TableCell className="tabular-nums text-sm">
                {formatDateTimeFr(order.createdAt)}
              </TableCell>
              <TableCell
                className={cn(
                  "max-w-[10rem] truncate text-sm",
                  isGuest ? "text-muted-foreground italic" : "font-medium",
                )}
              >
                {customerName}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn(orderTypeBadgeClass(order.type))}
                >
                  {typeBadgeLabel(order, locale)}
                </Badge>
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                {tReplace("orderItemsCount", { count: itemCount }, locale)}
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
              <TableCell className="text-right">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  className="border-brand-orange-200 text-brand-orange hover:bg-brand-orange-50 hover:text-brand-orange-600"
                  title={t("orderPrintTicket", locale)}
                  aria-label={t("orderPrintTicket", locale)}
                  disabled={printingOrderId !== null}
                  onClick={(event) => handlePrintTicket(event, order.id)}
                >
                  <Printer
                    className={cn("size-3.5", isPrinting && "animate-pulse")}
                  />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
