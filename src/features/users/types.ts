export const USER_ROLES = ["CUSTOMER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  isBlocked: boolean;
  createdAt: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  /** 0–1 ratio from the API (e.g. 0.5 = 50%). */
  cancelRate: number;
}

export interface PaginatedUsers {
  items: AdminUser[];
  total: number;
  limit: number;
  offset: number;
}

export type UsersSort =
  | "createdAt"
  | "cancelRate"
  | "cancelledOrders";

/** High cancel rate with enough volume to flag as potential abuse. */
export const ABUSE_CANCEL_RATE = 0.5;
export const ABUSE_MIN_ORDERS = 3;

export function isPotentialAbuser(user: AdminUser): boolean {
  return (
    user.totalOrders >= ABUSE_MIN_ORDERS &&
    user.cancelRate >= ABUSE_CANCEL_RATE
  );
}

export function formatCancelRatePercent(cancelRate: number): string {
  return `${Math.round(cancelRate * 100)} %`;
}

export function cancelRateClassName(cancelRate: number): string {
  if (cancelRate >= ABUSE_CANCEL_RATE) return "font-semibold text-red-700";
  if (cancelRate >= 0.25) return "font-medium text-amber-700";
  return "text-muted-foreground";
}
