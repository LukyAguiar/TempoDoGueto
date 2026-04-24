import { prisma } from "@/lib/prisma/client";
import type { AvailabilityInput } from "@/schemas/appointment";

export async function getAvailabilityByBusinessId(businessId: string) {
  return prisma.availability.findMany({
    where: { businessId },
    orderBy: { weekDay: "asc" },
  });
}

export async function upsertAvailability(
  businessId: string,
  data: AvailabilityInput
) {
  return prisma.availability.upsert({
    where: { businessId_weekDay: { businessId, weekDay: data.weekDay } },
    create: { businessId, ...data },
    update: { startTime: data.startTime, endTime: data.endTime },
  });
}

export async function deleteAvailability(businessId: string, weekDay: number) {
  return prisma.availability.deleteMany({
    where: { businessId, weekDay },
  });
}

export async function getBlockedSlotsByBusinessAndDate(
  businessId: string,
  date: string
) {
  return prisma.blockedSlot.findMany({
    where: {
      businessId,
      date: new Date(date + "T00:00:00.000Z"),
    },
  });
}

export async function createBlockedSlot(
  businessId: string,
  data: { date: string; startTime: string; endTime: string; reason?: string }
) {
  return prisma.blockedSlot.create({
    data: {
      businessId,
      date: new Date(data.date + "T00:00:00.000Z"),
      startTime: data.startTime,
      endTime: data.endTime,
      reason: data.reason,
    },
  });
}

export async function deleteBlockedSlot(id: string) {
  return prisma.blockedSlot.delete({ where: { id } });
}
