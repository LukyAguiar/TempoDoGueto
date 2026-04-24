import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const availabilitySchema = z.object({
  weekDay: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, "Formato inválido. Use HH:mm"),
  endTime: z.string().regex(timeRegex, "Formato inválido. Use HH:mm"),
}).refine((data) => data.startTime < data.endTime, {
  message: "Horário de início deve ser anterior ao de término",
  path: ["endTime"],
});

export const blockedSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  startTime: z.string().regex(timeRegex, "Formato inválido. Use HH:mm"),
  endTime: z.string().regex(timeRegex, "Formato inválido. Use HH:mm"),
  reason: z.string().optional(),
});

export const appointmentSchema = z.object({
  serviceId: z.string().cuid("Serviço inválido"),
  customerName: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  customerPhone: z.string().min(8, "Telefone inválido"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  startTime: z.string().regex(timeRegex, "Horário inválido"),
  notes: z.string().optional(),
});

export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type BlockedSlotInput = z.infer<typeof blockedSlotSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
