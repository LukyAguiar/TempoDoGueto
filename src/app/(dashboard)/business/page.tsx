import type { Metadata } from "next";
import { auth } from "@/lib/auth/config";
import { getBusinessByUserId } from "@/server/repositories/business.repository";
import { BusinessForm } from "@/components/forms/BusinessForm";

export const metadata: Metadata = { title: "Meu Negócio" };

export default async function BusinessPage() {
  const session = await auth();
  const business = await getBusinessByUserId(session!.user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Meu Negócio</h1>
      <p className="text-slate-500 mb-8">
        {business
          ? "Atualize as informações do seu negócio."
          : "Cadastre seu negócio para começar a receber agendamentos."}
      </p>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <BusinessForm
          defaultValues={
            business
              ? {
                  name: business.name,
                  slug: business.slug,
                  phone: business.phone ?? undefined,
                  address: business.address ?? undefined,
                  bio: business.bio ?? undefined,
                  logoUrl: business.logoUrl ?? undefined,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
