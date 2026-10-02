import { t, type Locale, type MessageKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import type { OrderStatus, OrderType, PaymentMethod } from "./types";

export function orderStatusLabel(status: OrderStatus, locale: Locale): string {
  return t(`orderStatus${status}` as MessageKey, locale);
}

export function orderTypeLabel(type: OrderType, locale: Locale): string {
  return t(`orderType${type}` as MessageKey, locale);
}

export function paymentMethodLabel(
  method: PaymentMethod,
  locale: Locale,
): string {
  return t(`paymentMethod${method}` as MessageKey, locale);
}

export function orderCustomerLabel(
  customer: { fullName: string } | null | undefined,
  locale: Locale,
): string {
  return customer?.fullName?.trim() || t("orderCustomerGuest", locale);
}

export function orderStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-900";
    case "PREPARING":
      return "bg-brand-orange-100 text-brand-orange-800";
    case "READY":
      return "bg-sky-100 text-sky-900";
    case "OUT_FOR_DELIVERY":
      return "bg-indigo-100 text-indigo-900";
    case "COMPLETED":
      return "bg-brand-green-100 text-brand-green-800";
    case "CANCELLED":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function orderTypeBadgeClass(type: OrderType): string {
  switch (type) {
    case "PICKUP":
      return "bg-brand-orange-50 text-brand-orange-800 ring-1 ring-brand-orange-200";
    case "DINE_IN":
      return "bg-brand-green-50 text-brand-green-800 ring-1 ring-brand-green-200";
    case "DELIVERY":
      return "bg-sky-50 text-sky-900 ring-1 ring-sky-200";
    default:
      return cn("bg-muted text-muted-foreground");
  }
}
