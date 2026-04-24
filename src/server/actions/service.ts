"use server";

import { auth } from "@/lib/auth/config";
import { serviceSchema } from "@/schemas/service";
import { getBusinessByUserId } from "@/server/repositories/business.repository";
import {
  createService,
  updateService,
  deleteService,
  getServiceById,
} from "@/server/repositories/service.repository";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string };

async function getAuthorizedBusiness(userId: string) {
  const business = await getBusinessByUserId(userId);
  if (!business) throw new Error("Negócio não encontrado.");
  return business;
}

export async function saveService(
  formData: unknown,
  serviceId?: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };

  const parsed = serviceSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const business = await getAuthorizedBusiness(session.user.id);

    if (serviceId) {
      // Verifica que o serviço pertence ao negócio do usuário
      const existing = await getServiceById(serviceId);
      if (!existing || existing.businessId !== business.id) {
        return { success: false, error: "Serviço não encontrado." };
      }
      await updateService(serviceId, parsed.data);
    } else {
      await createService(business.id, parsed.data);
    }

    revalidatePath("/services");
    return { success: true };
  } catch (err) {
    return { success: false, error: "Erro ao salvar serviço." };
  }
}

export async function removeService(serviceId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };

  try {
    const business = await getAuthorizedBusiness(session.user.id);
    const service = await getServiceById(serviceId);

    if (!service || service.businessId !== business.id) {
      return { success: false, error: "Serviço não encontrado." };
    }

    await deleteService(serviceId);
    revalidatePath("/services");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao remover serviço." };
  }
}
