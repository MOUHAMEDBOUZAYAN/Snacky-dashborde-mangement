export const ORDER_STATUSES = [
  "PENDING",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_TYPES = ["PICKUP", "DINE_IN", "DELIVERY"] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export const PAYMENT_METHODS = ["CASH"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface OrderItemExtra {
  name: string;
  priceDelta: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  size: string | null;
  sauce: string | null;
  extras: OrderItemExtra[];
}

/** Admin list/detail customer snapshot (null = guest order). */
export interface OrderCustomer {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
}

export interface Order {
  id: string;
  /** Sequential kitchen/display number from the backend (if present). */
  orderNumber?: number | null;
  userId: string | null;
  status: OrderStatus;
  type: OrderType;
  paymentMethod: PaymentMethod;
  deliveryAddress: string | null;
  /** @deprecated Unused by place-based delivery. */
  deliveryLatitude?: number | null;
  deliveryLongitude?: number | null;
  deliveryAddressDetail?: string | null;
  deliveryDistanceKm?: number | null;
  /** @deprecated Delivery is free — backend always 0; not shown in UI. */
  deliveryFee?: number;
  scheduledFor: string | null;
  note: string | null;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  /** Present on ADMIN list/detail; null for guests. */
  customer?: OrderCustomer | null;
  hasRated?: boolean;
  rating?: OrderRating | null;
}

export interface OrderRating {
  id: string;
  orderId: string;
  userId: string;
  serviceRating: number;
  serviceComment: string | null;
  driverRating: number | null;
  driverComment: string | null;
  driverId: string | null;
  createdAt: string;
}

export interface PaginatedOrders {
  items: Order[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Base transitions (mirrors NestJS). READY is overridden for DELIVERY
 * in getAllowedStatusTransitions (READY → OUT_FOR_DELIVERY).
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["COMPLETED"],
  OUT_FOR_DELIVERY: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

/** Type-aware next statuses — OUT_FOR_DELIVERY only for DELIVERY orders. */
export function getAllowedStatusTransitions(
  current: OrderStatus,
  type?: OrderType,
): OrderStatus[] {
  if (current === "READY") {
    return type === "DELIVERY" ? ["OUT_FOR_DELIVERY"] : ["COMPLETED"];
  }
  if (current === "OUT_FOR_DELIVERY") {
    return type === "DELIVERY" ? ["COMPLETED"] : [];
  }
  return ORDER_STATUS_TRANSITIONS[current];
}
