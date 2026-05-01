"use server";

import { appointmentSchema } from "@/schemas/appointment";
import { getBusinessBySlug, getBusinessByUserId } from "@/server/repositories/business.repository";
import { getServiceById } from "@/server/repositories/service.repository";
import { addMinutesToTime, generateTimeSlots, hasTimeOverlap, isSlotInPast } from "@/lib/dates";
import { updateAppointmentStatus, getAppointmentById } from "@/server/repositories/appointment.repository";
import { auth } from "@/lib/auth/config";
import { revalidatePath } from "next/cache";
import {
  notifyAppointmentCreated,
  notifyStatusChanged,
} from "@/server/services/notification.service";
import { prisma } from "@/lib/prisma/client";

// ─── Tipos ────────────────────────────────────────────────────

export type BookingConfirmation = {
  appointmentId: string;
  customerName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  businessName: string;
  businessPhone: string | null;
};

type BookResult =
  | { success: true; confirmation: BookingConfirmation }
  | { success: false; error: string };

type StatusResult = { success: true } | { success: false; error: string };

// ─── Actions ──────────────────────────────────────────────────

export async function bookAppointment(
  slug: string,
  formData: unknown
): Promise<BookResult> {
  const parsed = appointmentSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { serviceId, customerName, customerPhone, date, startTime, notes } =
    parsed.data;

  const business = await getBusinessBySlug(slug);
  if (!business) return { success: false, error: "Negócio não encontrado." };

  if (!business.isActive) {
    return { success: false, error: "Este negócio não está aceitando agendamentos no momento." };
  }

  const service = await getServiceById(serviceId);
  if (!service || service.businessId !== business.id || !service.isActive) {
    return { success: false, error: "Serviço inválido." };
  }

  const endTime = addMinutesToTime(startTime, service.durationMinutes);

  // ── Transação atômica: verifica disponibilidade e cria o agendamento ──
  // Isso evita race condition onde dois clientes reservam o mesmo slot
  // simultaneamente (check-then-act em operações separadas).
  let appointment: Awaited<ReturnType<typeof prisma.appointment.create>>;

  try {
    appointment = await prisma.$transaction(async (tx) => {
      // 1. Re-verifica disponibilidade dentro da transação
      const availability = await tx.availability.findUnique({
        where: {
          businessId_weekDay: {
            businessId: business.id,
            weekDay: new Date(date + "T12:00:00").getDay(),
          },
        },
      });

      if (!availability) {
        throw new Error("Dia sem disponibilidade configurada.");
      }

      const candidateSlots = generateTimeSlots(
        availability.startTime,
        availability.endTime,
        service.durationMinutes
      );

      if (!candidateSlots.includes(startTime)) {
        throw new Error("Horário fora do período de funcionamento.");
      }

      if (isSlotInPast(date, startTime)) {
        throw new Error("Não é possível agendar em horários passados.");
      }

      const dateObj = new Date(date + "T12:00:00");

      const existingAppointments = await tx.appointment.findMany({
        where: {
          businessId: business.id,
          date: dateObj,
          status: { not: "CANCELED" },
        },
        select: { startTime: true, endTime: true },
      });

      const blockedSlots = await tx.blockedSlot.findMany({
        where: { businessId: business.id, date: dateObj },
        select: { startTime: true, endTime: true },
      });

      const hasConflict = [...existingAppointments, ...blockedSlots].some(
        (slot) => hasTimeOverlap(startTime, endTime, slot.startTime, slot.endTime)
      );

      if (hasConflict) {
        throw new Error("Este horário não está mais disponível. Escolha outro.");
      }

      // 2. Cria o agendamento dentro da mesma transação
      return tx.appointment.create({
        data: {
          businessId: business.id,
          serviceId,
          customerName,
          customerPhone,
          date: dateObj,
          startTime,
          endTime,
          notes,
          status: "PENDING",
        },
      });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar agendamento.";
    return { success: false, error: message };
  }

  revalidatePath(`/${slug}`);
  revalidatePath("/appointments");

  await notifyAppointmentCreated({
    appointmentId: appointment.id,
    customerName,
    customerPhone,
    serviceName: service.name,
    date,
    startTime,
    businessName: business.name,
    businessPhone: business.phone ?? null,
  });

  return {
    success: true,
    confirmation: {
      appointmentId: appointment.id,
      customerName,
      serviceName: service.name,
      date,
      startTime,
      endTime,
      businessName: business.name,
      businessPhone: business.phone ?? null,
    },
  };
}

export async function changeAppointmentStatus(
  appointmentId: string,
  status: "CONFIRMED" | "CANCELED" | "COMPLETED"
): Promise<StatusResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };

  const business = await getBusinessByUserId(session.user.id);
  if (!business) return { success: false, error: "Negócio não encontrado." };

  if (!business.isActive) {
    return { success: false, error: "Este negócio não está aceitando agendamentos no momento." };
  }

  const appointment = await getAppointmentById(appointmentId);
  if (!appointment || appointment.businessId !== business.id) {
    return { success: false, error: "Agendamento não encontrado." };
  }

  await updateAppointmentStatus(appointmentId, status);

  revalidatePath(`/booking/${appointmentId}`);
  revalidatePath("/appointments");

  await notifyStatusChanged(status, {
    appointmentId,
    customerName: appointment.customerName,
    customerPhone: appointment.customerPhone,
    serviceName: appointment.service.name,
    date: appointment.date.toISOString().split("T")[0],
    startTime: appointment.startTime,
    businessName: appointment.business.name,
    businessPhone: appointment.business.phone ?? null,
  });

  return { success: true };
}
