"use server";

import { auth } from "@/lib/auth/config";
import { businessSchema } from "@/schemas/business";
import {
  isSlugTaken,
  upsertBusiness,
} from "@/server/repositories/business.repository";
import { revalidatePath } from "next/cache";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function saveBusiness(formData: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autorizado." };
  }

  const parsed = businessSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const slugInUse = await isSlugTaken(parsed.data.slug, session.user.id);
  if (slugInUse) {
    return { success: false, error: "Este slug já está em uso. Escolha outro." };
  }

  await upsertBusiness(session.user.id, parsed.data);

  revalidatePath("/business");
  revalidatePath(`/${parsed.data.slug}`);

  return { success: true };
}
