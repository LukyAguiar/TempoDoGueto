"use server";

import { auth } from "@/lib/auth/config";
import { availabilitySchema, blockedSlotSchema } from "@/schemas/appointment";
import { getBusinessByUserId } from "@/server/repositories/business.repository";
import {
  upsertAvailability,
  deleteAvailability,
  createBlockedSlot,
  deleteBlockedSlot,
} from "@/server/repositories/availability.repository";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string };

async function requireBusiness(userId: string) {
  const business = await getBusinessByUserId(userId);
  if (!business) throw new Error("Negócio não encontrado.");
  return business;
}

export async function saveAvailability(
  formData: unknown
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };

  const parsed = availabilitySchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const business = await requireBusiness(session.user.id);
    await upsertAvailability(business.id, parsed.data);
    revalidatePath("/availability");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao salvar disponibilidade." };
  }
}

export async function removeAvailability(
  weekDay: number
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };

  try {
    const business = await requireBusiness(session.user.id);
    await deleteAvailability(business.id, weekDay);
    revalidatePath("/availability");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao remover disponibilidade." };
  }
}

export async function saveBlockedSlot(
  formData: unknown
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };

  const parsed = blockedSlotSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const business = await requireBusiness(session.user.id);
    await createBlockedSlot(business.id, parsed.data);
    revalidatePath("/availability");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao bloquear horário." };
  }
}

export async function removeBlockedSlot(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };

  try {
    await deleteBlockedSlot(id);
    revalidatePath("/availability");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao remover bloqueio." };
  }
}
