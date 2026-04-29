import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { getPageConfig } from "@/server/repositories/page-config.repository";
import { DEFAULT_PAGE_CONFIG } from "@/types/page-config";
import { ThemedPublicPage } from "@/components/booking/ThemedPublicPage";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const business = await prisma.business.findUnique({
    where: { slug: params.slug },
    select: { name: true, bio: true },
  });
  if (!business) return { title: "Negócio não encontrado" };
  return { title: business.name, description: business.bio ?? undefined };
}

export default async function BusinessPublicPage({ params }: Props) {
  const business = await prisma.business.findUnique({
    where: { slug: params.slug },
    include: {
      services: { where: { isActive: true }, orderBy: { name: "asc" } },
    },
  });
  if (!business) notFound();

  const saved = await getPageConfig(business.id);
  const config = saved ?? { id: "", businessId: business.id, ...DEFAULT_PAGE_CONFIG };

  return (
    <ThemedPublicPage
      business={business}
      services={business.services}
      config={config}
    />
  );
}
