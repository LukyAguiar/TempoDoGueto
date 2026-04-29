import { prisma } from "@/lib/prisma/client";
import type { PageConfig, SectionKey, TeamMember, GalleryItem } from "@/types/page-config";
import { DEFAULT_PAGE_CONFIG } from "@/types/page-config";

function deserialize(raw: any): PageConfig {
  return {
    id: raw.id,
    businessId: raw.businessId,
    theme: raw.theme,
    primaryColor: raw.primaryColor,
    accentColor: raw.accentColor,
    bgColor: raw.bgColor,
    cardBg: raw.cardBg,
    textColor: raw.textColor,
    buttonText: raw.buttonText,
    slogan: raw.slogan,
    instagram: raw.instagram,
    whatsapp: raw.whatsapp,
    bannerUrl: raw.bannerUrl,
    overlayOpacity: raw.overlayOpacity,
    sections: (raw.sections as SectionKey[]) ?? DEFAULT_PAGE_CONFIG.sections,
    teamMembers: (raw.teamMembers as TeamMember[]) ?? [],
    gallery: (raw.gallery as GalleryItem[]) ?? [],
    showPrices: raw.showPrices,
    showDuration: raw.showDuration,
  };
}

export async function getPageConfig(businessId: string): Promise<PageConfig | null> {
  const raw = await prisma.pageConfig.findUnique({ where: { businessId } });
  if (!raw) return null;
  return deserialize(raw);
}

export async function upsertPageConfig(
  businessId: string,
  data: Partial<Omit<PageConfig, "id" | "businessId">>
): Promise<PageConfig> {
  const raw = await prisma.pageConfig.upsert({
    where: { businessId },
    create: { businessId, ...DEFAULT_PAGE_CONFIG, ...data } as any,
    update: data as any,
  });
  return deserialize(raw);
}
