import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getBusinessByUserId } from "@/server/repositories/business.repository";
import { getServicesByBusinessId } from "@/server/repositories/service.repository";
import { ServiceList } from "@/components/business/ServiceList";

export const metadata: Metadata = { title: "Serviços" };

export default async function ServicesPage() {
  const session = await auth();
  const business = await getBusinessByUserId(session!.user.id);

  if (!business) redirect("/business");

  const services = await getServicesByBusinessId(business.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Serviços</h1>
        <p className="text-sm" style={{ color: "#71717a" }}>
          Gerencie os serviços oferecidos pelo seu negócio.
        </p>
      </div>

      <div
        className="rounded-3xl p-4 sm:p-6 max-w-3xl"
        style={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <ServiceList services={services} />
      </div>
    </div>
  );
}
