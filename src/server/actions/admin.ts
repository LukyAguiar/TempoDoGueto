"use server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  createBarberUser,
  updateUser,
  setUserActive,
  setBusinessActive,
} from "@/server/repositories/admin.repository";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string };

// ── Guard reutilizável ────────────────────────────────────────
async function requireAdmin(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Não autenticado." };
  if (session.user.role !== "ADMIN") return { ok: false, error: "Acesso negado." };
  return { ok: true };
}

// ── Schemas ───────────────────────────────────────────────────
const createUserSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

const updateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

// ── Actions de usuário ────────────────────────────────────────

export async function adminCreateUser(formData: unknown): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = createUserSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { success: false, error: "Este e-mail já está cadastrado." };

  const passwordHash = await bcrypt.hash(password, 12);
  await createBarberUser({ name, email, passwordHash });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function adminUpdateUser(
  userId: string,
  formData: unknown
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = updateUserSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  await updateUser(userId, parsed.data);
  revalidatePath("/admin/users");
  return { success: true };
}

export async function adminResetPassword(
  userId: string,
  newPassword: string
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  if (newPassword.length < 6) {
    return { success: false, error: "Senha deve ter ao menos 6 caracteres." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function adminToggleUser(
  userId: string,
  isActive: boolean
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  // Admin não pode desativar a si mesmo
  const session = await auth();
  if (session?.user?.id === userId) {
    return { success: false, error: "Você não pode desativar sua própria conta." };
  }

  await setUserActive(userId, isActive);
  revalidatePath("/admin/users");
  return { success: true };
}

// ── Actions de negócio ────────────────────────────────────────

export async function adminToggleBusiness(
  businessId: string,
  isActive: boolean
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  await setBusinessActive(businessId, isActive);
  revalidatePath("/admin/businesses");
  return { success: true };
}
