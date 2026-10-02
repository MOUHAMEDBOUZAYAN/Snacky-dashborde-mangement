import { z } from "zod";

/** Mirrors backend `adminRatingResponseSchema`. */
export const adminRatingSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  createdAt: z.string().datetime(),
  customerName: z.string(),
  serviceRating: z.number().int(),
  serviceComment: z.string().nullable(),
  driverRating: z.number().int().nullable(),
  driverComment: z.string().nullable(),
  driverName: z.string().nullable(),
  driverId: z.string().uuid().nullable(),
});

export const paginatedRatingsSchema = z.object({
  items: z.array(adminRatingSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
});
