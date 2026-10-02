export type {
  Order,
  OrderItem,
  OrderItemExtra,
  OrderStatus,
  OrderType,
  PaginatedOrders,
  PaymentMethod,
} from "@/features/orders/types";

export {
  ORDER_STATUSES,
  ORDER_TYPES,
  PAYMENT_METHODS,
} from "@/features/orders/types";

export interface OrdersChartPoint {
  date: Date;
  label: string;
  count: number;
}

export type OrdersChartRange = "7d" | "30d" | "90d";

export interface OverviewStats {
  ordersTodayCount: number;
  pendingOrdersCount: number;
  completedTodayCount: number;
  revenueToday: number;
  recentOrders: import("@/features/orders/types").Order[];
  /** Kept for KPI window compatibility; chart uses its own query. */
  ordersLast7Days: OrdersChartPoint[];
}
