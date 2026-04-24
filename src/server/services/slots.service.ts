import { prisma } from "@/lib/prisma/client";
import {
  generateTimeSlots,
  hasTimeOverlap,
  addMinutesToTime,
  isSlotInPast,
} from "@/lib/dates";

type GetAvailableSlotsParams = {
  businessId: string;
  date: string;        // "yyyy-MM-dd"
  durationMinutes: number;
};

/**
 * Retorna os horários disponíveis para agendamento em uma data específica.
 *
 * Lógica:
 * 1. Busca a disponibilidade semanal do dia da semana correspondente
 * 2. Gera todos os slots possíveis dentro do horário de funcionamento
 * 3. Remove slots que conflitam com agendamentos já existentes
 * 4. Remove slots que conflitam com bloqueios manuais
 * 5. Remove slots que já passaram (horário no passado)
 */
export async function getAvailableSlots({
  businessId,
  date,
  durationMinutes,
}: GetAvailableSlotsParams): Promise<string[]> {
  // weekDay: 0 = Sunday, conforme Date.getDay()
  const dateObj = new Date(date + "T12:00:00");
  const weekDay = dateObj.getDay();

  // 1. Busca disponibilidade do dia
  const availability = await prisma.availability.findUnique({
    where: { businessId_weekDay: { businessId, weekDay } },
  });

  // Se não há disponibilidade configurada para esse dia, retorna vazio
  if (!availability) return [];

  // 2. Gera todos os slots candidatos
  const candidateSlots = generateTimeSlots(
    availability.startTime,
    availability.endTime,
    durationMinutes
  );

  if (candidateSlots.length === 0) return [];

  // 3. Busca agendamentos existentes na data (status != CANCELED)
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      businessId,
      date: new Date(date + "T00:00:00.000Z"),
      status: { not: "CANCELED" },
    },
    select: { startTime: true, endTime: true },
  });

  // 4. Busca bloqueios manuais na data
  const blockedSlots = await prisma.blockedSlot.findMany({
    where: {
      businessId,
      date: new Date(date + "T00:00:00.000Z"),
    },
    select: { startTime: true, endTime: true },
  });

  // 5. Filtra os slots disponíveis
  const available = candidateSlots.filter((startTime) => {
    const endTime = addMinutesToTime(startTime, durationMinutes);

    // Descarta slots no passado
    if (isSlotInPast(date, startTime)) return false;

    // Descarta slots com conflito de agendamentos
    const hasAppointmentConflict = existingAppointments.some((appt) =>
      hasTimeOverlap(startTime, endTime, appt.startTime, appt.endTime)
    );
    if (hasAppointmentConflict) return false;

    // Descarta slots com conflito de bloqueios
    const hasBlockedConflict = blockedSlots.some((block) =>
      hasTimeOverlap(startTime, endTime, block.startTime, block.endTime)
    );
    if (hasBlockedConflict) return false;

    return true;
  });

  return available;
}
