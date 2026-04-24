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
      where: {
        businessId: business.id,
        date: { gte: new Date() },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Disponibilidade</h1>
      <p className="text-slate-500 mb-8">
        Configure os dias e horários em que seu negócio atende.
      </p>

      <div className="space-y-8 max-w-2xl">
        {/* Grade semanal */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Horários de funcionamento
          </h2>
          <AvailabilityGrid availability={availability} />
        </div>

        {/* Bloqueios manuais */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Bloqueios manuais
          </h2>
          <BlockedSlotManager blockedSlots={blockedSlots} />
        </div>
      </div>
    </div>
  );
}
