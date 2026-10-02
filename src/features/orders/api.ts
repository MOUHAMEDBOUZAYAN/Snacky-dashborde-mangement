import { api } from "@/lib/api";

import { orderSchema, paginatedOrdersSchema } from "./schemas";
import type { Order, OrderStatus, PaginatedOrders } from "./types";

export function matchesOrderSearch(order: Order, search: string): boolean {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;

  if (order.id.toLowerCase().includes(needle)) return true;
  if (order.customer?.fullName?.toLowerCase().includes(needle)) return true;
  if (order.customer?.phone?.toLowerCase().includes(needle)) return true;
  if (order.customer?.email?.toLowerCase().includes(needle)) return true;
  if (order.deliveryAddress?.toLowerCase().includes(needle)) return true;
  if (order.deliveryAddressDetail?.toLowerCase().includes(needle)) return true;
  if (order.note?.toLowerCase().includes(needle)) return true;

  return false;
}

export async function fetchOrders(params: {
  status?: OrderStatus | "ALL";
  limit?: number;
  offset?: number;
}): Promise<PaginatedOrders> {
  const { data } = await api.get<unknown>("/orders", {
    params: {
      ...(params.status && params.status !== "ALL"
        ? { status: params.status }
        : {}),
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    },
  });
  return paginatedOrdersSchema.parse(data);
}

/**
 * Backend has no order search param — load a window of orders and filter client-side.
 */
export async function searchOrders(params: {
  status?: OrderStatus | "ALL";
  search: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedOrders> {
  const pageSize = params.limit ?? 20;
  const offset = params.offset ?? 0;
  const collected: Order[] = [];
  let apiOffset = 0;
  const maxPages = 5;

  for (let page = 0; page < maxPages; page += 1) {
    const result = await fetchOrders({
      status: params.status,
      limit: 100,
      offset: apiOffset,
    });
    collected.push(...result.items);

    if (result.items.length === 0) break;
    if (apiOffset + result.items.length >= result.total) break;
    apiOffset += 100;
  }

  const filtered = collected.filter((order) =>
    matchesOrderSearch(order, params.search),
  );

  return {
    items: filtered.slice(offset, offset + pageSize),
    total: filtered.length,
    limit: pageSize,
    offset,
  };
}

export async function fetchOrder(id: string): Promise<Order> {
  const { data } = await api.get<unknown>(`/orders/${id}`);
  return orderSchema.parse(data);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order> {
  const { data } = await api.patch<unknown>(`/orders/${id}/status`, { status });
  return orderSchema.parse(data);
}
