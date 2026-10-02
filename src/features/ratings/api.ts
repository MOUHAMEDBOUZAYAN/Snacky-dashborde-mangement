import { api } from "@/lib/api";

import { paginatedRatingsSchema } from "./schemas";
import type { PaginatedRatings } from "./types";

export async function fetchRatings(params: {
  driverId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedRatings> {
  const { data } = await api.get<unknown>("/ratings", {
    params: {
      ...(params.driverId ? { driverId: params.driverId } : {}),
      ...(params.from ? { from: params.from } : {}),
      ...(params.to ? { to: params.to } : {}),
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    },
  });
  return paginatedRatingsSchema.parse(data);
}
