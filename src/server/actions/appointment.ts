"use server";

import { appointmentSchema } from "@/schemas/appointment";
import { getBusinessBySlug, getBusinessByUserId } from "@/server/repositories/business.repository";
import { getServiceById } from "@/server/repositories/service.repository";
import { getAvailableSlots } from "@/server/services/slots.service";
import {
  createAppointment,
  updateAppointmentStatus,
  getAppointmentById,
} from "@/server/repositories/appointment.repository";
import { addMinutesToTime } from "@/lib/dates";
import { auth } from "@/lib/auth/config";
import { revalidatePath } from "next/cache";
import {
  notifyAppointmentCreated,
  notifyStatusChanged,
} from "@/server/services/notification.service";

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

  // Bloqueia agendamento se a barbearia estiver inativa
  if (!business.isActive) {
    return { success: false, error: "Este negócio não está aceitando agendamentos no momento." };
  }

  const service = await getServiceById(serviceId);
  if (!service || service.businessId !== business.id || !service.isActive) {
    return { success: false, error: "Serviço inválido." };
  }

  const availableSlots = await getAvailableSlots({
    businessId: business.id,
    date,
    durationMinutes: service.durationMinutes,
  });

  if (!availableSlots.includes(startTime)) {
    return {
      success: false,
      error: "Este horário não está mais disponível. Escolha outro.",
    };
  }

  const endTime = addMinutesToTime(startTime, service.durationMinutes);

  const appointment = await createAppointment({
    businessId: business.id,
    serviceId,
    customerName,
    customerPhone,
    date,
    startTime,
    endTime,
    notes,
  });

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

  // Bloqueia agendamento se a barbearia estiver inativa
  if (!business.isActive) {
    return { success: false, error: "Este negócio não está aceitando agendamentos no momento." };
  }

  const appointment = await getAppointmentById(appointmentId);
  if (!appointment || appointment.businessId !== business.id) {
    return { success: false, error: "Agendamento não encontrado." };
  }

  await updateAppointmentStatus(appointmentId, status);

  // Revalida a página de status do cliente
  revalidatePath(`/booking/${appointmentId}`);
  revalidatePath("/appointments");

  // Dispara notificação para o cliente
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
