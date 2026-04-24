import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  durationMinutes: z
    .number({ invalid_type_error: "Duração inválida" })
    .int()
    .min(15, "Duração mínima é 15 minutos")
    .max(480, "Duração máxima é 8 horas"),
  price: z
    .string()
    .optional()
    .transform((val) => (val === "" || val === undefined ? null : parseFloat(val)))
    .pipe(z.number().min(0).nullable()),
  isActive: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
