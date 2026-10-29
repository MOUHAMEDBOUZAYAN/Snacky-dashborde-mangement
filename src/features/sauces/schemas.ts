import { z } from "zod";

export const createSauceSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(100),
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

export const updateSauceSchema = createSauceSchema.partial();

export type CreateSauceFormValues = z.infer<typeof createSauceSchema>;
