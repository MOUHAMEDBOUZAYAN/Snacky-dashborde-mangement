import { z } from "zod";

/**
 * Mirrors backend `moneySchema` exactly:
 * positive number, step 0.01 (DECIMAL DH — not cents).
 */
export const moneySchema = z.coerce
  .number({ invalid_type_error: "Prix invalide" })
  .positive("Le prix doit être supérieur à 0")
  .multipleOf(0.01, "Le prix doit avoir au plus 2 décimales");

/** Mirrors backend `categorySlugSchema`. */
export const categorySlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug: lettres minuscules, chiffres et tirets uniquement",
  );

/**
 * Mirrors backend `createCategorySchema` (defaults applied in the form UI,
 * not via zod `.default()`, so RHF types stay clean).
 */
export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(100),
  slug: categorySlugSchema,
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

export const updateCategorySchema = createCategorySchema.partial();

/**
 * Form schema mirroring backend `createMenuItemSchema`.
 * `description` / `imageUrl` are strings in the form; empty → null on submit
 * (backend: optional/nullable string / URL).
 */
export const createMenuItemSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(150),
  description: z.string().trim().max(1000),
  price: moneySchema,
  imageUrl: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || z.string().url().safeParse(value).success,
      "URL d'image invalide",
    ),
  isAvailable: z.boolean(),
  categoryId: z.string().min(1, "La catégorie est requise"),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;
export type CreateMenuItemFormValues = z.infer<typeof createMenuItemSchema>;

export function toMenuItemPayload(values: CreateMenuItemFormValues) {
  const imageUrl = values.imageUrl.trim();
  const description = values.description.trim();

  return {
    name: values.name.trim(),
    description: description.length > 0 ? description : null,
    price: values.price,
    imageUrl: imageUrl.length > 0 ? imageUrl : null,
    isAvailable: values.isAvailable,
    categoryId: values.categoryId,
  };
}
