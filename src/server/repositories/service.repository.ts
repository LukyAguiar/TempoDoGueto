import { prisma } from "@/lib/prisma/client";
import type { ServiceInput } from "@/schemas/service";

export async function getServicesByBusinessId(businessId: string) {
  return prisma.service.findMany({
    where: { businessId },
    orderBy: { name: "asc" },
  });
}

export async function getServiceById(id: string) {
  return prisma.service.findUnique({ where: { id } });
}

export async function createService(businessId: string, data: ServiceInput) {
  return prisma.service.create({
    data: {
      businessId,
      name: data.name,
      durationMinutes: data.durationMinutes,
      price: data.price ?? null,
      isActive: data.isActive,
    },
  });
}

export async function updateService(id: string, data: ServiceInput) {
  return prisma.service.update({
    where: { id },
    data: {
      name: data.name,
      durationMinutes: data.durationMinutes,
      price: data.price ?? null,
      isActive: data.isActive,
    },
  });
}

export async function deleteService(id: string) {
  return prisma.service.delete({ where: { id } });
}
