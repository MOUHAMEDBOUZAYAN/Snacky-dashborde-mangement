"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { t, type Locale } from "@/lib/i18n";

import * as usersApi from "./api";

export const usersKeys = {
  all: ["users"] as const,
  list: (params: { search: string; page: number; pageSize: number }) =>
    [...usersKeys.all, "list", params] as const,
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

export function useUsersListQuery(params: {
  search: string;
  page: number;
  pageSize: number;
}) {
  const offset = (params.page - 1) * params.pageSize;

  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () =>
      usersApi.fetchUsers({
        search: params.search || undefined,
        limit: params.pageSize,
        offset,
      }),
    placeholderData: (previous) => previous,
  });
}

export function useBlockUserMutation() {
  const qc = useQueryClient();
  const { locale } = useAuth();

  return useMutation({
    mutationFn: (id: string) => usersApi.blockUser(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: usersKeys.all });
      toast.success(t("userBlocked", locale));
    },
    onError: (error) => {
      toast.error(blockErrorMessage(error, locale));
    },
  });
}

export function useUnblockUserMutation() {
  const qc = useQueryClient();
  const { locale } = useAuth();

  return useMutation({
    mutationFn: (id: string) => usersApi.unblockUser(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: usersKeys.all });
      toast.success(t("userUnblocked", locale));
    },
    onError: (error) => {
      toast.error(blockErrorMessage(error, locale));
    },
  });
}
