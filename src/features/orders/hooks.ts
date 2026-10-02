"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { overviewKeys } from "@/features/overview/hooks";
import { t } from "@/lib/i18n";

import * as ordersApi from "./api";
import type { OrderStatus } from "./types";

export const ordersKeys = {
  all: ["orders"] as const,
  list: (params: {
    status: string;
    search: string;
    page: number;
    pageSize: number;
  }) => [...ordersKeys.all, "list", params] as const,
  detail: (id: string) => [...ordersKeys.all, "detail", id] as const,
};

/** TODO(realtime): replace polling with websockets for live order updates. */
const REFETCH_MS = 15_000;

export function useOrdersListQuery(params: {
  status: OrderStatus | "ALL";
  search: string;
  page: number;
  pageSize: number;
}) {
  const offset = (params.page - 1) * params.pageSize;
  const search = params.search.trim();

  return useQuery({
    queryKey: ordersKeys.list({ ...params, search }),
    queryFn: () =>
      search
        ? ordersApi.searchOrders({
            status: params.status,
            search,
            limit: params.pageSize,
            offset,
          })
        : ordersApi.fetchOrders({
            status: params.status,
            limit: params.pageSize,
            offset,
          }),
    refetchInterval: REFETCH_MS,
    placeholderData: (previous) => previous,
  });
}

export function useOrderDetailQuery(id: string | null) {
  return useQuery({
    queryKey: ordersKeys.detail(id ?? ""),
    queryFn: () => ordersApi.fetchOrder(id!),
    enabled: Boolean(id),
    refetchInterval: id ? REFETCH_MS : false,
  });
}

export function usePendingOrdersCountQuery() {
  return useQuery({
    queryKey: [...ordersKeys.all, "pending-count"] as const,
    queryFn: async () => {
      const page = await ordersApi.fetchOrders({
        status: "PENDING",
        limit: 1,
        offset: 0,
      });
      return page.total;
    },
    refetchInterval: REFETCH_MS,
  });
}

export function useUpdateOrderStatusMutation() {
  const qc = useQueryClient();
  const { locale } = useAuth();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateOrderStatus(id, status),
    onSuccess: async (order) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ordersKeys.all }),
        qc.invalidateQueries({ queryKey: overviewKeys.all }),
      ]);
      qc.setQueryData(ordersKeys.detail(order.id), order);
      toast.success(t("orderStatusUpdated", locale));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("orderStatusUpdateError", locale),
      );
    },
  });
}
