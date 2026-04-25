import type { Metadata } from "next";
import { auth } from "@/lib/auth/config";
import { getBusinessByUserId } from "@/server/repositories/business.repository";
import { BusinessForm } from "@/components/forms/BusinessForm";

export const metadata: Metadata = { title: "Meu Negócio" };

export default async function BusinessPage() {
  const session = await auth();
  const business = await getBusinessByUserId(session!.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Meu Negócio</h1>
        <p className="text-sm" style={{ color: "#71717a" }}>
          {business
            ? "Atualize as informações do seu negócio."
            : "Cadastre seu negócio para começar a receber agendamentos."}
        </p>
      </div>

      <div
        className="rounded-3xl p-4 sm:p-6 max-w-3xl"
        style={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)" }}
      >
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
