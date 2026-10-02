"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { blockUser, unblockUser } from "@/features/users/api";
import { t, tReplace, type Locale } from "@/lib/i18n";

import * as driversApi from "./api";
import type { CreateDriverFormValues, UpdateDriverCommissionFormValues } from "./schemas";

export const driversKeys = {
  all: ["drivers"] as const,
  list: (params: { search: string; page: number; pageSize: number }) =>
    [...driversKeys.all, "list", params] as const,
  stats: (id: string) => [...driversKeys.all, "stats", id] as const,
  statement: (
    id: string,
    params: {
      unpaidOnly: boolean;
      from: string;
      to: string;
      page: number;
      pageSize: number;
    },
  ) => [...driversKeys.all, "statement", id, params] as const,
};

function blockErrorMessage(error: unknown, locale: Locale): string {
  const msg = error instanceof Error ? error.message : "";
  if (/yourself/i.test(msg)) {
    return t("userBlockSelfError", locale);
  }
  if (/admin/i.test(msg)) {
    return t("userBlockAdminError", locale);
  }
  return msg || t("userBlockError", locale);
}

export function useDriversListQuery(params: {
  search: string;
  page: number;
  pageSize: number;
}) {
  const offset = (params.page - 1) * params.pageSize;

  return useQuery({
    queryKey: driversKeys.list(params),
    queryFn: () =>
      driversApi.fetchDrivers({
        search: params.search || undefined,
        limit: params.pageSize,
        offset,
      }),
    placeholderData: (previous) => previous,
  });
}

export function useDriverStatsQuery(id: string | null) {
  return useQuery({
    queryKey: driversKeys.stats(id ?? ""),
    queryFn: () => driversApi.fetchDriverStats(id!),
    enabled: Boolean(id),
  });
}

export function useDriverStatementQuery(
  id: string | null,
  params: {
    unpaidOnly: boolean;
    from: string;
    to: string;
    page: number;
    pageSize: number;
  },
) {
  const offset = (params.page - 1) * params.pageSize;

  return useQuery({
    queryKey: driversKeys.statement(id ?? "", params),
    queryFn: () =>
      driversApi.fetchDriverStatement(id!, {
        unpaidOnly: params.unpaidOnly,
        from: params.from || undefined,
        to: params.to || undefined,
        limit: params.pageSize,
        offset,
      }),
    enabled: Boolean(id),
    placeholderData: (previous) => previous,
  });
}

export function useCreateDriverMutation() {
  const qc = useQueryClient();
  const { locale } = useAuth();

  return useMutation({
    mutationFn: (payload: CreateDriverFormValues) =>
      driversApi.createDriver(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: driversKeys.all });
      toast.success(t("driverCreated", locale));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("driverCreateError", locale),
      );
    },
  });
}

export function useUpdateDriverCommissionMutation() {
  const qc = useQueryClient();
  const { locale } = useAuth();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateDriverCommissionFormValues;
    }) => driversApi.updateDriverCommission(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: driversKeys.all });
      toast.success(t("driverCommissionUpdated", locale));
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("driverCommissionUpdateError", locale),
      );
    },
  });
}

export function useBlockDriverMutation() {
  const qc = useQueryClient();
  const { locale } = useAuth();

  return useMutation({
    mutationFn: (id: string) => blockUser(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: driversKeys.all });
      toast.success(t("userBlocked", locale));
    },
    onError: (error) => {
      toast.error(blockErrorMessage(error, locale));
    },
  });
}

export function useUnblockDriverMutation() {
  const qc = useQueryClient();
  const { locale } = useAuth();

  return useMutation({
    mutationFn: (id: string) => unblockUser(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: driversKeys.all });
      toast.success(t("userUnblocked", locale));
    },
    onError: (error) => {
      toast.error(blockErrorMessage(error, locale));
    },
  });
}

export function usePayoutDriverMutation() {
  const qc = useQueryClient();
  const { locale } = useAuth();

  return useMutation({
    mutationFn: (id: string) => driversApi.payoutDriver(id),
    onSuccess: async (result) => {
      await qc.invalidateQueries({ queryKey: driversKeys.all });
      toast.success(
        tReplace("driverPayoutSuccess", { amount: result.amountPaid }, locale),
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : t("driverPayoutError", locale),
      );
    },
  });
}
