import { z } from "zod";

/** Mirrors backend `phoneSchema`. */
export const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^\+?[0-9]{8,15}$/,
    "Téléphone : 8 à 15 chiffres, + optionnel",
  );

/** Mirrors backend `passwordSchema`. */
export const passwordSchema = z
  .string()
  .min(8, "Mot de passe : 8 caractères minimum")
  .max(72, "Mot de passe : 72 caractères maximum");

/** Mirrors backend `createDriverSchema`. */
export const createDriverSchema = z.object({
  fullName: z.string().trim().min(1, "Le nom est requis").max(120),
  email: z.string().trim().email("E-mail invalide"),
  phone: phoneSchema,
  password: passwordSchema,
  commissionPercent: z.coerce
    .number({ invalid_type_error: "Commission invalide" })
    .min(0, "Commission : minimum 0 %")
    .max(100, "Commission : maximum 100 %"),
});

/** Mirrors backend `updateUserSchema` (commission only for drivers). */
export const updateDriverCommissionSchema = z.object({
  commissionPercent: z.coerce
    .number({ invalid_type_error: "Commission invalide" })
    .min(0, "Commission : minimum 0 %")
    .max(100, "Commission : maximum 100 %"),
});

export const driverStatsSchema = z.object({
  totalDeliveries: z.number().int(),
  completedDeliveries: z.number().int(),
  cancelledDeliveries: z.number().int(),
  totalEarned: z.number(),
  unpaidAmount: z.number(),
  paidAmount: z.number(),
  averageDriverRating: z.number().nullable(),
  ratingsCount: z.number().int(),
});

export const driverSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  role: z.literal("LIVREUR"),
  isBlocked: z.boolean(),
  commissionPercent: z.number().nullable(),
  createdAt: z.string().datetime(),
  totalOrders: z.number().int(),
  completedOrders: z.number().int(),
  cancelledOrders: z.number().int(),
  cancelRate: z.number(),
  driverStats: driverStatsSchema.optional(),
});

export const paginatedDriversSchema = z.object({
  items: z.array(driverSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
});

export const driverStatementItemSchema = z.object({
  orderId: z.string(),
  completedAt: z.string().datetime(),
  orderTotal: z.number(),
  commissionPercent: z.number(),
  commissionAmount: z.number(),
  paidOut: z.boolean(),
  paidOutAt: z.string().datetime().nullable(),
});

export const driverStatementSchema = z.object({
  items: z.array(driverStatementItemSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
});

export const payoutDriverResponseSchema = z.object({
  driverId: z.string().uuid(),
  ordersPaid: z.number().int(),
  amountPaid: z.number(),
  paidOutAt: z.string().datetime(),
});

export type CreateDriverFormValues = z.infer<typeof createDriverSchema>;
export type UpdateDriverCommissionFormValues = z.infer<
  typeof updateDriverCommissionSchema
>;
