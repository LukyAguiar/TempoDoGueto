"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma/client";
import { registerSchema } from "@/schemas/auth";

type RegisterResult =
  | { success: true }
  | { success: false; error: string };

export async function registerUser(
  formData: unknown
): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(formData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "Este e-mail já está cadastrado." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name, email, passwordHash },
  });

  return { success: true };
}
