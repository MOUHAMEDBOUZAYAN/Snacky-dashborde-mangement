import { z } from "zod";

import { ORDER_STATUSES, ORDER_TYPES, PAYMENT_METHODS } from "./types";

/** Mirrors backend `orderItemExtraResponseSchema`. */
const orderItemExtraSchema = z.object({
  name: z.string(),
  priceDelta: z.number(),
});

/** Mirrors backend `orderItemResponseSchema` (admin shape). */
const orderItemSchema = z.object({
  id: z.string(),
  menuItemId: z.string(),
  menuItemName: z.string(),
  quantity: z.number().int(),
  unitPrice: z.number(),
  size: z.string().nullable(),
  sauce: z.string().nullable(),
  extras: z.array(orderItemExtraSchema),
});

/** Mirrors backend `orderCustomerResponseSchema`. */
export const orderCustomerSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  phone: z.string().nullable(),
  email: z.union([z.string().email(), z.literal(""), z.null()]),
});

/** Mirrors backend `orderRatingResponseSchema`. */
export const orderRatingSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  userId: z.string().uuid(),
  serviceRating: z.number().int(),
  serviceComment: z.string().nullable(),
  driverRating: z.number().int().nullable(),
  driverComment: z.string().nullable(),
  driverId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
});

/**
 * Mirrors backend `orderResponseSchema` on GET /orders and GET /orders/:id.
 * Delivery fields are null for PICKUP / DINE_IN.
 */
export const orderSchema = z.object({
  id: z.string(),
  orderNumber: z.number().int(),
  userId: z.string().uuid().nullable(),
  status: z.enum(ORDER_STATUSES),
  type: z.enum(ORDER_TYPES),
  paymentMethod: z.enum(PAYMENT_METHODS),
  deliveryAddress: z.string().nullable(),
  /** @deprecated Unused by place-based delivery; may still be null from API. */
  deliveryLatitude: z.number().nullable().optional(),
  deliveryLongitude: z.number().nullable().optional(),
  deliveryAddressDetail: z.string().nullable().optional(),
  deliveryDistanceKm: z.number().nullable().optional(),
  /** @deprecated Delivery is free — backend always 0; not shown in UI. */
  deliveryFee: z.number().optional(),
  scheduledFor: z.string().datetime().nullable(),
  note: z.string().nullable(),
  total: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  items: z.array(orderItemSchema),
  customer: orderCustomerSchema.nullable().optional(),
  hasRated: z.boolean().optional(),
  rating: orderRatingSchema.nullable().optional(),
});

export const paginatedOrdersSchema = z.object({
  items: z.array(orderSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
});

export type OrderSchema = z.infer<typeof orderSchema>;
export type PaginatedOrdersSchema = z.infer<typeof paginatedOrdersSchema>;
