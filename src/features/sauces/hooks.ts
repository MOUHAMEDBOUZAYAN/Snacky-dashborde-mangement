"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { t } from "@/lib/i18n";

import * as saucesApi from "./api";
import type { CreateSauceInput, Sauce, UpdateSauceInput } from "./types";

export const sauceKeys = {
  all: ["sauces"] as const,
  list: () => [...sauceKeys.all, "list"] as const,
};

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function useSaucesQuery() {
  return useQuery({
    queryKey: sauceKeys.list(),
    queryFn: saucesApi.fetchSauces,
  });
}

export function useCreateSauceMutation() {
  const qc = useQueryClient();
  const { locale } = useAuth();

  return useMutation({
    mutationFn: (input: CreateSauceInput) => saucesApi.createSauce(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: sauceKeys.all });
      toast.success(t("sauceCreated", locale));
    },
    onError: (error) => {
      toast.error(errorMessage(error, t("sauceCreateError", locale)));
    },
  });
}

export function useUpdateSauceMutation() {
  const qc = useQueryClient();
  const { locale } = useAuth();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateSauceInput;
    }) => saucesApi.updateSauce(id, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: sauceKeys.all });
      toast.success(t("sauceUpdated", locale));
    },
    onError: (error) => {
      toast.error(errorMessage(error, t("sauceUpdateError", locale)));
    },
  });
}

export function useToggleSauceActiveMutation() {
  const qc = useQueryClient();
  const { locale } = useAuth();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      saucesApi.updateSauce(id, { isActive }),
    onMutate: async ({ id, isActive }) => {
      await qc.cancelQueries({ queryKey: sauceKeys.list() });
      const previous = qc.getQueryData<Sauce[]>(sauceKeys.list());
      qc.setQueryData<Sauce[]>(sauceKeys.list(), (current) =>
        (current ?? []).map((sauce) =>
          sauce.id === id ? { ...sauce, isActive } : sauce,
        ),
      );
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        qc.setQueryData(sauceKeys.list(), context.previous);
      }
      toast.error(errorMessage(error, t("sauceUpdateError", locale)));
    },
    onSuccess: async (_data, variables) => {
      await qc.invalidateQueries({ queryKey: sauceKeys.list() });
      toast.success(
        variables.isActive
          ? t("sauceActive", locale)
          : t("sauceInactive", locale),
      );
    },
  });
}

export function useDeleteSauceMutation() {
  const qc = useQueryClient();
  const { locale } = useAuth();

  return useMutation({
    mutationFn: (id: string) => saucesApi.deleteSauce(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: sauceKeys.all });
      toast.success(t("sauceDeleted", locale));
    },
    onError: (error) => {
      toast.error(errorMessage(error, t("sauceDeleteError", locale)));
    },
  });
}
