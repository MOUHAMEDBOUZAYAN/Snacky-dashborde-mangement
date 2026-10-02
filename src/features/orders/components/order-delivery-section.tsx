"use client";

import { Phone } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { formatTimeFr } from "@/lib/format";
import { t } from "@/lib/i18n";

import type { Order } from "../types";

interface OrderDeliverySectionProps {
  order: Order;
}

export function OrderDeliverySection({ order }: OrderDeliverySectionProps) {
  const { locale } = useAuth();

  if (order.type !== "DELIVERY") return null;

  const place = order.deliveryAddress?.trim() || null;
  const detail = order.deliveryAddressDetail?.trim() || null;

  return (
    <section className="space-y-3 rounded-xl border border-sky-200 bg-sky-50/60 px-3 py-3">
      <h3 className="text-sm font-semibold text-brand-charcoal">
        {t("orderDeliverySection", locale)}
      </h3>

      {(order.customer?.fullName || order.customer?.phone) && (
        <div className="flex flex-col gap-2 rounded-lg border border-brand-orange-200 bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          {order.customer.fullName ? (
            <p className="font-semibold text-brand-charcoal">
              {order.customer.fullName}
            </p>
          ) : null}
          {order.customer?.phone ? (
            <a
              href={`tel:${order.customer.phone}`}
              className="inline-flex items-center gap-1.5 text-base font-semibold tabular-nums text-brand-orange-700 hover:underline"
            >
              <Phone className="size-4 shrink-0" />
              {order.customer.phone}
            </a>
          ) : null}
        </div>
      )}

      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("orderDeliveryPlace", locale)}
          </p>
          <p className="text-base font-semibold text-brand-charcoal">
            {place ?? "—"}
          </p>
        </div>

        {detail ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("orderDeliveryAddressDetail", locale)}
            </p>
            <p className="text-sm text-brand-charcoal">{detail}</p>
          </div>
        ) : null}

        {order.scheduledFor ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("orderScheduledFor", locale)}
            </p>
            <p className="text-base font-semibold tabular-nums text-sky-900">
              {formatTimeFr(order.scheduledFor)}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
