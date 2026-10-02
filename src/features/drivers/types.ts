export interface DriverStats {
  totalDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  totalEarned: number;
  unpaidAmount: number;
  paidAmount: number;
  averageDriverRating: number | null;
  ratingsCount: number;
}

export interface Driver {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "LIVREUR";
  isBlocked: boolean;
  commissionPercent: number | null;
  createdAt: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  cancelRate: number;
  driverStats?: DriverStats;
}

export interface PaginatedDrivers {
  items: Driver[];
  total: number;
  limit: number;
  offset: number;
}

export interface DriverStatementItem {
  orderId: string;
  completedAt: string;
  orderTotal: number;
  commissionPercent: number;
  commissionAmount: number;
  paidOut: boolean;
  paidOutAt: string | null;
}

export interface DriverStatement {
  items: DriverStatementItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface PayoutDriverResult {
  driverId: string;
  ordersPaid: number;
  amountPaid: number;
  paidOutAt: string;
}
