import type { AppointmentStatus } from "@prisma/client";

// Re-exporta o enum do Prisma para uso no frontend sem importar @prisma/client diretamente
export { AppointmentStatus };

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEK_DAY_LABELS: Record<WeekDay, string> = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  CANCELED: "Cancelado",
  COMPLETED: "Concluído",
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300/30",
  CONFIRMED: "bg-green-100 text-green-800 ring-1 ring-green-300/30",
  CANCELED: "bg-red-100 text-red-800 ring-1 ring-red-300/30",
  COMPLETED: "bg-blue-100 text-blue-800 ring-1 ring-blue-300/30",
};

// Tipo para slots de horário disponível (usado no fluxo público de agendamento)
export type TimeSlot = {
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  available: boolean;
};
