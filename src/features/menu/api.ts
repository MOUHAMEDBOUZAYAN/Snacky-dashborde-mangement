import { api } from "@/lib/api";

import type {
  Category,
  CategoryWithItems,
  CreateCategoryInput,
  CreateMenuItemInput,
  MenuItem,
  MenuListQuery,
  UpdateCategoryInput,
  UpdateMenuItemInput,
} from "./types";

function toQuery(params: MenuListQuery): Record<string, string> {
  const query: Record<string, string> = {};
  if (params.categoryId) query.categoryId = params.categoryId;
  if (params.availableOnly !== undefined) {
    query.availableOnly = params.availableOnly ? "true" : "false";
  }
  if (params.grouped !== undefined) {
    query.grouped = params.grouped ? "true" : "false";
  }
  return query;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>("/menu/categories");
  return data;
}

export async function fetchCategory(id: string): Promise<Category & { menuItems: MenuItem[] }> {
  const { data } = await api.get<Category & { menuItems: MenuItem[] }>(
    `/menu/categories/${id}`,
  );
  return data;
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<Category> {
  const { data } = await api.post<Category>("/menu/categories", input);
  return data;
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<Category> {
  const { data } = await api.patch<Category>(`/menu/categories/${id}`, input);
  return data;
}

export async function deleteCategory(id: string): Promise<{ id: string; deleted: boolean }> {
  const { data } = await api.delete<{ id: string; deleted: boolean }>(
    `/menu/categories/${id}`,
  );
  return data;
}

export async function fetchMenuItems(
  params: MenuListQuery = {},
): Promise<MenuItem[]> {
  const { data } = await api.get<MenuItem[]>("/menu", {
    params: toQuery({ ...params, grouped: false }),
  });
  return data;
}

export async function fetchMenuGrouped(): Promise<CategoryWithItems[]> {
  const { data } = await api.get<CategoryWithItems[]>("/menu", {
    params: toQuery({ grouped: true }),
  });
  return data;
}

export async function fetchMenuItem(id: string): Promise<MenuItem> {
  const { data } = await api.get<MenuItem>(`/menu/${id}`);
  return data;
}

export async function createMenuItem(
  input: CreateMenuItemInput,
): Promise<MenuItem> {
  const { data } = await api.post<MenuItem>("/menu", input);
  return data;
}

export async function updateMenuItem(
  id: string,
  input: UpdateMenuItemInput,
): Promise<MenuItem> {
  const { data } = await api.patch<MenuItem>(`/menu/${id}`, input);
  return data;
}

export async function deleteMenuItem(
  id: string,
): Promise<{ id: string; deleted: boolean }> {
  const { data } = await api.delete<{ id: string; deleted: boolean }>(
    `/menu/${id}`,
  );
  return data;
}
