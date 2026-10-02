import { api } from "@/lib/api";

import type { AdminUser, PaginatedUsers, UserRole } from "./types";

export async function fetchUsers(params: {
  search?: string;
  role?: UserRole;
  limit?: number;
  offset?: number;
}): Promise<PaginatedUsers> {
  const { data } = await api.get<PaginatedUsers>("/users", {
    params: {
      ...(params.search?.trim() ? { search: params.search.trim() } : {}),
      ...(params.role ? { role: params.role } : {}),
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    },
  });
  return data;
}

export async function blockUser(id: string): Promise<AdminUser> {
  const { data } = await api.patch<AdminUser>(`/users/${id}/block`);
  return data;
}

export async function unblockUser(id: string): Promise<AdminUser> {
  const { data } = await api.patch<AdminUser>(`/users/${id}/unblock`);
  return data;
}
