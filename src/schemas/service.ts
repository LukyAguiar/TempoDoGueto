import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  durationMinutes: z
    .number({ invalid_type_error: "Duração inválida" })
    .int()
    .min(15, "Duração mínima é 15 minutos")
    .max(480, "Duração máxima é 8 horas"),
  price: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === "" || val === undefined || val === null) return null;
      const n = typeof val === "number" ? val : parseFloat(val);
      return isNaN(n) ? null : n;
    })
    .pipe(z.number().min(0).nullable()),
  isActive: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
