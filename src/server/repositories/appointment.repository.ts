import { prisma } from "@/lib/prisma/client";
import type { AppointmentStatus } from "@prisma/client";

export async function getAppointmentsByBusiness(
  businessId: string,
  filters?: { status?: AppointmentStatus; fromDate?: Date }
) {
  return prisma.appointment.findMany({
    where: {
      businessId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.fromDate && { date: { gte: filters.fromDate } }),
    },
    include: { service: { select: { name: true, durationMinutes: true } } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
}

export async function createAppointment(data: {
  businessId: string;
  serviceId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}) {
  // Usa T12:00:00 (meio-dia) para evitar problema de fuso horário (UTC-3 → dia anterior)
  const dateObj = new Date(data.date + "T12:00:00");

  return prisma.appointment.create({
    data: {
      businessId: data.businessId,
      serviceId: data.serviceId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      date: dateObj,
      startTime: data.startTime,
      endTime: data.endTime,
      notes: data.notes,
      status: "PENDING",
    },
  });
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
) {
  return prisma.appointment.update({
    where: { id },
    data: { status },
  });
}

export async function getAppointmentById(id: string) {
  return prisma.appointment.findUnique({
    where: { id },
    include: { service: true, business: true },
  });
}
