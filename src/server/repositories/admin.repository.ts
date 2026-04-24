import { prisma } from "@/lib/prisma/client";

export async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      business: { select: { id: true, name: true, slug: true, isActive: true } },
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { business: true },
  });
}

export async function createBarberUser(data: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  return prisma.user.create({
    data: { ...data, role: "BARBER", isActive: true },
  });
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; isActive?: boolean }
) {
  return prisma.user.update({ where: { id }, data });
}

export async function setUserActive(id: string, isActive: boolean) {
  return prisma.user.update({ where: { id }, data: { isActive } });
}

export async function getAllBusinesses() {
  return prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { appointments: true, services: true } },
    },
  });
}

export async function setBusinessActive(id: string, isActive: boolean) {
  return prisma.business.update({ where: { id }, data: { isActive } });
}
