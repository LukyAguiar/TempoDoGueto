import { prisma } from "@/lib/prisma/client";
import type { BusinessInput } from "@/schemas/business";

export async function getBusinessByUserId(userId: string) {
  return prisma.business.findUnique({
    where: { userId },
  });
}

export async function getBusinessBySlug(slug: string) {
  return prisma.business.findUnique({
    where: { slug },
    include: {
      services: { where: { isActive: true }, orderBy: { name: "asc" } },
      availability: { orderBy: { weekDay: "asc" } },
    },
  });
}

export async function isSlugTaken(slug: string, excludeUserId?: string) {
  const business = await prisma.business.findUnique({
    where: { slug },
    select: { userId: true },
  });
  if (!business) return false;
  if (excludeUserId && business.userId === excludeUserId) return false;
  return true;
}

export async function upsertBusiness(userId: string, data: BusinessInput) {
  return prisma.business.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}
