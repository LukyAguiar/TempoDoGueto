import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getBusinessByUserId } from "@/server/repositories/business.repository";
import { getAvailabilityByBusinessId } from "@/server/repositories/availability.repository";
import { prisma } from "@/lib/prisma/client";
import { AvailabilityGrid } from "@/components/business/AvailabilityGrid";
import { BlockedSlotManager } from "@/components/business/BlockedSlotManager";

export const metadata: Metadata = { title: "Disponibilidade" };

export default async function AvailabilityPage() {
  const session = await auth();
  const business = await getBusinessByUserId(session!.user.id);

  if (!business) redirect("/business");

  const [availability, blockedSlots] = await Promise.all([
    getAvailabilityByBusinessId(business.id),
    prisma.blockedSlot.findMany({
      where: { businessId: business.id, date: { gte: new Date() } },
      orderBy: { date: "asc" },
    }),
  ]);

  const cardStyle = { backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Disponibilidade</h1>
        <p className="text-sm" style={{ color: "#71717a" }}>
          Configure os dias e horários em que seu negócio atende.
        </p>
      </div>

      <div className="space-y-6 max-w-4xl">
        <div className="rounded-3xl p-4 sm:p-6" style={cardStyle}>
          <h2 className="text-base font-bold text-white mb-1">Horários de funcionamento</h2>
          <p className="text-xs mb-5" style={{ color: "#71717a" }}>Ative os dias de atendimento e ajuste os horários.</p>
          <AvailabilityGrid availability={availability} />
        </div>

        <div className="rounded-3xl p-4 sm:p-6" style={cardStyle}>
          <h2 className="text-base font-bold text-white mb-1">Bloqueios manuais</h2>
          <p className="text-xs mb-5" style={{ color: "#71717a" }}>Use para folgas, almoço, reuniões ou horários indisponíveis.</p>
          <BlockedSlotManager blockedSlots={blockedSlots} />
        </div>
      </div>
    </div>
  );
}
