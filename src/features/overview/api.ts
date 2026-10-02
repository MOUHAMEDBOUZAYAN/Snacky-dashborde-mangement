import { api } from "@/lib/api";

import type { Order, OrderStatus, PaginatedOrders } from "@/features/orders/types";

const PAGE_SIZE = 100;

export async function fetchOrdersPage(params: {
  status?: OrderStatus;
  limit?: number;
  offset?: number;
}): Promise<PaginatedOrders> {
  const { data } = await api.get<PaginatedOrders>("/orders", {
    params: {
      ...(params.status ? { status: params.status } : {}),
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    },
  });
  return data;
}

export async function fetchPendingOrdersCount(): Promise<number> {
  const page = await fetchOrdersPage({ status: "PENDING", limit: 1, offset: 0 });
  return page.total;
}

/**
 * Paginate newest-first until we have orders older than `until`,
 * or no more pages. Caps pages to avoid runaway requests.
 */
export async function fetchOrdersUntil(
  until: Date,
  maxPages = 10,
): Promise<Order[]> {
  const collected: Order[] = [];
  let offset = 0;

  for (let page = 0; page < maxPages; page += 1) {
    const result = await fetchOrdersPage({ limit: PAGE_SIZE, offset });
    collected.push(...result.items);

    if (result.items.length === 0) break;
    if (offset + result.items.length >= result.total) break;

    const oldest = result.items[result.items.length - 1];
    if (new Date(oldest.createdAt) < until) break;

    offset += PAGE_SIZE;
  }

  return collected;
}
