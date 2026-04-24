import { z } from "zod";

export const businessSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  slug: z
    .string()
    .min(2, "Slug deve ter ao menos 2 caracteres")
    .max(60, "Slug muito longo")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug deve conter apenas letras minúsculas, números e hífens"
    ),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres").optional(),
  logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

export type BusinessInput = z.infer<typeof businessSchema>;
