"use client";

import { useState } from "react";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { StarScore } from "@/components/ui/star-score";
import {
  formatDateTimeFr,
  formatPriceDh,
  formatTimeFr,
  shortId,
} from "@/lib/format";
import { t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import {
  useOrderDetailQuery,
  useUpdateOrderStatusMutation,
} from "../hooks";
import {
  orderStatusBadgeClass,
  orderStatusLabel,
  orderTypeBadgeClass,
  orderTypeLabel,
  paymentMethodLabel,
} from "../labels";
import { generateOrderInvoicePdf } from "../pdf";
import { printOrderTicket } from "../ticket-print";
import {
  getAllowedStatusTransitions,
  type OrderStatus,
} from "../types";
import { OrderDeliverySection } from "./order-delivery-section";

function transitionLabel(status: OrderStatus, locale: Locale): string {
  switch (status) {
    case "PREPARING":
      return t("orderMarkPreparing", locale);
    case "READY":
      return t("orderMarkReady", locale);
    case "OUT_FOR_DELIVERY":
      return t("orderMarkOutForDelivery", locale);
    case "COMPLETED":
      return t("orderMarkCompleted", locale);
    case "CANCELLED":
      return t("orderCancel", locale);
    default:
      return orderStatusLabel(status, locale);
  }
}

interface OrderDetailSheetProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailSheet({
  orderId,
  open,
  onOpenChange,
}: OrderDetailSheetProps) {
  const { locale } = useAuth();
  const detailQuery = useOrderDetailQuery(orderId);
  const updateStatus = useUpdateOrderStatusMutation();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const [ticketBusy, setTicketBusy] = useState(false);

  const order = detailQuery.data;
  const allowed = order
    ? getAllowedStatusTransitions(order.status, order.type)
    : [];
  const pending = updateStatus.isPending;

  async function handleTransition(next: OrderStatus) {
    if (!order) return;
    if (next === "CANCELLED") {
      if (!confirmCancel) {
        setConfirmCancel(true);
        return;
      }
    }
    setConfirmCancel(false);
    try {
      await updateStatus.mutateAsync({ id: order.id, status: next });
    } catch {
      // toast in mutation
    }
  }

  async function handleInvoice(action: "download" | "print") {
    if (!order) return;
    setInvoiceBusy(true);
    try {
      await generateOrderInvoicePdf(order, locale, action);
    } catch {
      toast.error(t("orderInvoiceError", locale));
    } finally {
      setInvoiceBusy(false);
    }
  }

  async function handlePrintTicket() {
    if (!order) return;
    setTicketBusy(true);
    try {
      await printOrderTicket(order);
    } catch {
      toast.error(t("orderTicketPrintError", locale));
    } finally {
      setTicketBusy(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) setConfirmCancel(false);
        onOpenChange(next);
      }}
    >
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle>{t("orderDetail", locale)}</SheetTitle>
          <SheetDescription>
            {order ? `#${shortId(order.id, 10)}` : t("loading", locale)}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-5 px-1 pb-6">
          {detailQuery.isLoading || !order ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className={cn(orderStatusBadgeClass(order.status))}
                >
                  {orderStatusLabel(order.status, locale)}
                </Badge>
                <Badge
                  variant="secondary"
                  className={cn(orderTypeBadgeClass(order.type))}
                >
                  {orderTypeLabel(order.type, locale)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDateTimeFr(order.createdAt)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="gap-1.5 bg-brand-orange hover:bg-brand-orange-600"
                  disabled={ticketBusy}
                  onClick={handlePrintTicket}
                >
                  <Printer className="size-3.5" />
                  {ticketBusy
                    ? t("loading", locale)
                    : t("orderPrintTicket", locale)}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={invoiceBusy}
                  className="gap-1.5"
                  onClick={() => handleInvoice("download")}
                >
                  <Download className="size-3.5" />
                  {invoiceBusy
                    ? t("loading", locale)
                    : t("orderDownloadInvoice", locale)}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={invoiceBusy}
                  className="gap-1.5"
                  onClick={() => handleInvoice("print")}
                >
                  <Printer className="size-3.5" />
                  {t("orderPrintInvoice", locale)}
                </Button>
              </div>

              <section className="space-y-2 rounded-xl border border-brand-orange-100 bg-brand-orange-50/40 px-3 py-3">
                <h3 className="text-sm font-semibold text-brand-charcoal">
                  {t("orderCustomer", locale)}
                </h3>
                {order.customer ? (
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">
                        {t("userName", locale)}
                      </dt>
                      <dd className="font-medium text-brand-charcoal">
                        {order.customer.fullName}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">
                        {t("orderCustomerPhone", locale)}
                      </dt>
                      <dd>
                        {order.customer.phone ? (
                          <a
                            href={`tel:${order.customer.phone}`}
                            className="font-medium text-brand-orange-700 hover:underline"
                          >
                            {order.customer.phone}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">
                        {t("orderCustomerEmail", locale)}
                      </dt>
                      <dd className="truncate">
                        {order.customer.email ? (
                          <a
                            href={`mailto:${order.customer.email}`}
                            className="font-medium text-brand-orange-700 hover:underline"
                          >
                            {order.customer.email}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm italic text-muted-foreground">
                    {t("orderCustomerGuestOrder", locale)}
                  </p>
                )}
              </section>

              {order.type === "DELIVERY" ? (
                <OrderDeliverySection order={order} />
              ) : null}

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-brand-charcoal">
                  {t("orderItems", locale)}
                </h3>
                <ul className="space-y-3">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-xl border border-border bg-white px-3 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-brand-charcoal">
                            {item.menuItemName}{" "}
                            <span className="text-muted-foreground">
                              × {item.quantity}
                            </span>
                          </p>
                          <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                            {item.size ? (
                              <p>
                                {t("orderSize", locale)}: {item.size}
                              </p>
                            ) : null}
                            {item.sauce ? (
                              <p>
                                {t("orderSauce", locale)}: {item.sauce}
                              </p>
                            ) : null}
                            {item.extras.length > 0 ? (
                              <p>
                                {t("orderExtras", locale)}:{" "}
                                {item.extras.map((e) => e.name).join(", ")}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <p className="shrink-0 text-sm font-medium tabular-nums">
                          {formatPriceDh(item.unitPrice)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <Separator />

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">
                    {t("orderPaymentMethod", locale)}
                  </dt>
                  <dd className="font-medium">
                    {paymentMethodLabel(order.paymentMethod, locale)}
                  </dd>
                </div>
                {order.scheduledFor ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">
                      {t("orderScheduledFor", locale)}
                    </dt>
                    <dd className="font-medium tabular-nums">
                      {formatTimeFr(order.scheduledFor)}
                    </dd>
                  </div>
                ) : null}
                {order.note ? (
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">
                      {t("orderNote", locale)}
                    </dt>
                    <dd className="rounded-lg bg-muted/60 px-2 py-1.5">
                      {order.note}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-3 border-t border-border pt-2 text-base">
                  <dt className="font-semibold">{t("orderTotal", locale)}</dt>
                  <dd className="font-semibold tabular-nums text-brand-orange-700">
                    {formatPriceDh(order.total)}
                  </dd>
                </div>
              </dl>

              {order.rating ? (
                <section className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-3">
                  <h3 className="text-sm font-semibold text-brand-charcoal">
                    {t("orderRating", locale)}
                  </h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">
                        {t("ratingsService", locale)}
                      </dt>
                      <dd>
                        <StarScore value={order.rating.serviceRating} />
                      </dd>
                    </div>
                    {order.rating.serviceComment ? (
                      <p className="rounded-lg bg-white/80 px-2 py-1.5 text-brand-charcoal">
                        {order.rating.serviceComment}
                      </p>
                    ) : null}
                    {order.rating.driverRating != null ? (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">
                          {t("ratingsDriver", locale)}
                        </dt>
                        <dd>
                          <StarScore value={order.rating.driverRating} />
                        </dd>
                      </div>
                    ) : null}
                    {order.rating.driverComment ? (
                      <p className="rounded-lg bg-white/80 px-2 py-1.5 text-brand-charcoal">
                        {order.rating.driverComment}
                      </p>
                    ) : null}
                  </dl>
                </section>
              ) : null}

              {allowed.length > 0 ? (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold text-brand-charcoal">
                    {t("orderStatus", locale)}
                  </h3>
                  {confirmCancel ? (
                    <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {t("orderCancelConfirm", locale)}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {allowed.map((next) => {
                      const isCancel = next === "CANCELLED";
                      return (
                        <Button
                          key={next}
                          type="button"
                          size="sm"
                          variant={isCancel ? "destructive" : "default"}
                          disabled={pending}
                          className={
                            isCancel
                              ? undefined
                              : "bg-brand-orange hover:bg-brand-orange-600"
                          }
                          onClick={() => handleTransition(next)}
                        >
                          {pending
                            ? t("loading", locale)
                            : isCancel && confirmCancel
                              ? t("confirm", locale)
                              : transitionLabel(next, locale)}
                        </Button>
                      );
                    })}
                    {confirmCancel ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() => setConfirmCancel(false)}
                      >
                        {t("cancel", locale)}
                      </Button>
                    ) : null}
                  </div>
                </section>
              ) : null}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
