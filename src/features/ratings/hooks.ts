"use client";

import { useQuery } from "@tanstack/react-query";

import * as ratingsApi from "./api";

export const ratingsKeys = {
  all: ["ratings"] as const,
  list: (params: {
    driverId: string;
    from: string;
    to: string;
    page: number;
    pageSize: number;
  }) => [...ratingsKeys.all, "list", params] as const,
};

export function useRatingsListQuery(params: {
  driverId: string;
  from: string;
  to: string;
  page: number;
  pageSize: number;
}) {
  const offset = (params.page - 1) * params.pageSize;

  return useQuery({
    queryKey: ratingsKeys.list(params),
    queryFn: () =>
      ratingsApi.fetchRatings({
        driverId: params.driverId || undefined,
        from: params.from || undefined,
        to: params.to || undefined,
        limit: params.pageSize,
        offset,
      }),
    placeholderData: (previous) => previous,
  });
}
