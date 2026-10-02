"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { t } from "@/lib/i18n";

import * as menuApi from "./api";
import type {
  CreateCategoryInput,
  CreateMenuItemInput,
  UpdateCategoryInput,
  UpdateMenuItemInput,
} from "./types";

export const menuKeys = {
  all: ["menu"] as const,
  categories: () => [...menuKeys.all, "categories"] as const,
  items: () => [...menuKeys.all, "items"] as const,
};

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: menuKeys.categories(),
    queryFn: menuApi.fetchCategories,
  });
}

export function useMenuItemsQuery(params?: { categoryId?: string }) {
  const categoryId =
    params?.categoryId && params.categoryId !== "all"
      ? params.categoryId
      : undefined;

  return useQuery({
    queryKey: [...menuKeys.items(), { categoryId: categoryId ?? null }],
    queryFn: () =>
      menuApi.fetchMenuItems({
        categoryId,
        grouped: false,
      }),
  });
}

export function useCreateCategoryMutation() {
  const qc = useQueryClient();
  const { locale } = useAuth();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => menuApi.createCategory(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: menuKeys.all });
      toast.success(t("menuCategoryCreated", locale));
    },
    onError: (error) => {
      toast.error(errorMessage(error, t("menuCategoryCreateError", locale)));
    },
  });
}

export function useUpdateCategoryMutation() {
  const qc = useQueryClient();
  const { locale } = useAuth();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateCategoryInput;
    }) => menuApi.updateCategory(id, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: menuKeys.all });
      toast.success(t("menuCategoryUpdated", locale));
    },
    onError: (error) => {
      toast.error(errorMessage(error, t("menuCategoryUpdateError", locale)));
    },
  });
}

export function useDeleteCategoryMutation() {
  const qc = useQueryClient();
  const { locale } = useAuth();

  return useMutation({
    mutationFn: (id: string) => menuApi.deleteCategory(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: menuKeys.all });
      toast.success(t("menuCategoryDeleted", locale));
    },
    onError: (error) => {
      toast.error(errorMessage(error, t("menuCategoryDeleteError", locale)));
    },
  });
}

export function useCreateMenuItemMutation() {
  const qc = useQueryClient();
  const { locale } = useAuth();

  return useMutation({
    mutationFn: (input: CreateMenuItemInput) => menuApi.createMenuItem(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: menuKeys.all });
      toast.success(t("menuItemCreated", locale));
    },
    onError: (error) => {
      toast.error(errorMessage(error, t("menuItemCreateError", locale)));
    },
  });
}

export function useUpdateMenuItemMutation() {
  const qc = useQueryClient();
  const { locale } = useAuth();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateMenuItemInput;
    }) => menuApi.updateMenuItem(id, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: menuKeys.all });
      toast.success(t("menuItemUpdated", locale));
    },
    onError: (error) => {
      toast.error(errorMessage(error, t("menuItemUpdateError", locale)));
    },
  });
}

export function useToggleMenuItemAvailabilityMutation() {
  const qc = useQueryClient();
  const { locale } = useAuth();

  return useMutation({
    mutationFn: ({
      id,
      isAvailable,
    }: {
      id: string;
      isAvailable: boolean;
    }) => menuApi.updateMenuItem(id, { isAvailable }),
    onSuccess: async (_data, variables) => {
      await qc.invalidateQueries({ queryKey: menuKeys.items() });
      toast.success(
        variables.isAvailable
          ? t("menuItemAvailable", locale)
          : t("menuItemUnavailable", locale),
      );
    },
    onError: (error) => {
      toast.error(errorMessage(error, t("menuItemUpdateError", locale)));
    },
  });
}

export function useDeleteMenuItemMutation() {
  const qc = useQueryClient();
  const { locale } = useAuth();

  return useMutation({
    mutationFn: (id: string) => menuApi.deleteMenuItem(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: menuKeys.all });
      toast.success(t("menuItemDeleted", locale));
    },
    onError: (error) => {
      toast.error(errorMessage(error, t("menuItemDeleteError", locale)));
    },
  });
}
