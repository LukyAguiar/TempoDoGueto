import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { BookingFlow } from "@/components/booking/BookingFlow";

type Props = {
  params: { slug: string };
};

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
      services: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!business) notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header do negócio */}
        <div className="text-center mb-10">
          {business.logoUrl && (
            <img
              src={business.logoUrl}
              alt={business.name}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
            />
          )}
          <h1 className="text-3xl font-bold text-slate-900">{business.name}</h1>
          {business.bio && (
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">{business.bio}</p>
          )}
          {business.address && (
            <p className="text-slate-400 text-sm mt-1">{business.address}</p>
          )}
        </div>

        {/* Fluxo de agendamento */}
        <BookingFlow slug={params.slug} services={business.services} />
      </div>
    </div>
  );
}
