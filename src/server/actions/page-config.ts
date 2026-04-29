"use server";

import { auth } from "@/lib/auth/config";
import { getBusinessByUserId } from "@/server/repositories/business.repository";
import { upsertPageConfig, getPageConfig } from "@/server/repositories/page-config.repository";
import { revalidatePath } from "next/cache";
import type { PageConfig } from "@/types/page-config";

type Result<T> = { success: true; data: T } | { success: false; error: string };

export async function savePageConfig(
  data: Partial<Omit<PageConfig, "id" | "businessId">>
): Promise<Result<PageConfig>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };

  const business = await getBusinessByUserId(session.user.id);
  if (!business) return { success: false, error: "Negócio não encontrado." };

  const config = await upsertPageConfig(business.id, data);
  revalidatePath(`/${business.slug}`);
  return { success: true, data: config };
}

export async function loadPageConfig(): Promise<Result<PageConfig>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };

  const business = await getBusinessByUserId(session.user.id);
  if (!business) return { success: false, error: "Negócio não encontrado." };

  const config = await getPageConfig(business.id);
  if (!config) {
    // Return defaults without persisting
    return {
      success: true,
      data: {
        id: "",
        businessId: business.id,
        theme: "barber",
        primaryColor: "#f6b914",
        accentColor: "#f6b914",
        bgColor: "#0a0a0a",
        cardBg: "#161616",
        textColor: "#ffffff",
        buttonText: "Agendar agora",
        slogan: null,
        instagram: null,
        whatsapp: null,
        bannerUrl: null,
        overlayOpacity: 50,
        sections: ["hero", "services", "team", "gallery", "location"],
        teamMembers: [],
        gallery: [],
        showPrices: true,
        showDuration: true,
      },
    };
  }
  return { success: true, data: config };
}
