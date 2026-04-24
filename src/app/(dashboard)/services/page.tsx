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

  if (!business) {
    redirect("/business");
  }

  const services = await getServicesByBusinessId(business.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Serviços</h1>
      <p className="text-slate-500 mb-8">
        Gerencie os serviços oferecidos pelo seu negócio.
      </p>

      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
        <ServiceList services={services} />
      </div>
    </div>
  );
}
