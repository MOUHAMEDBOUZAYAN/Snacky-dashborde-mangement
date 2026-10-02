import { api } from "@/lib/api";

import {
  driverSchema,
  driverStatementSchema,
  driverStatsSchema,
  paginatedDriversSchema,
  payoutDriverResponseSchema,
  type CreateDriverFormValues,
  type UpdateDriverCommissionFormValues,
} from "./schemas";
import type {
  Driver,
  DriverStatement,
  DriverStats,
  PaginatedDrivers,
  PayoutDriverResult,
} from "./types";

export async function fetchDrivers(params: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedDrivers> {
  const { data } = await api.get<unknown>("/users", {
    params: {
      role: "LIVREUR",
      ...(params.search?.trim() ? { search: params.search.trim() } : {}),
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    },
  });
  return paginatedDriversSchema.parse(data);
}

export async function createDriver(
  payload: CreateDriverFormValues,
): Promise<Driver> {
  const { data } = await api.post<unknown>("/users/drivers", {
    fullName: payload.fullName.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    password: payload.password,
    commissionPercent: payload.commissionPercent,
  });
  return driverSchema.parse(data);
}

export async function updateDriverCommission(
  id: string,
  payload: UpdateDriverCommissionFormValues,
): Promise<Driver> {
  const { data } = await api.patch<unknown>(`/users/${id}`, {
    commissionPercent: payload.commissionPercent,
  });
  return driverSchema.parse(data);
}

export async function fetchDriverStats(id: string): Promise<DriverStats> {
  const { data } = await api.get<unknown>(`/users/${id}/driver-stats`);
  return driverStatsSchema.parse(data);
}

export async function fetchDriverStatement(
  id: string,
  params: {
    unpaidOnly?: boolean;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  },
): Promise<DriverStatement> {
  const { data } = await api.get<unknown>(`/users/${id}/driver-statement`, {
    params: {
      ...(params.unpaidOnly ? { unpaidOnly: "true" } : {}),
      ...(params.from ? { from: params.from } : {}),
      ...(params.to ? { to: params.to } : {}),
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
    },
  });
  return driverStatementSchema.parse(data);
}

export async function payoutDriver(id: string): Promise<PayoutDriverResult> {
  const { data } = await api.patch<unknown>(`/users/${id}/payout-driver`);
  return payoutDriverResponseSchema.parse(data);
}
