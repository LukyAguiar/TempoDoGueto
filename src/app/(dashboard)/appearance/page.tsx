import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getBusinessByUserId } from "@/server/repositories/business.repository";
import { getPageConfig } from "@/server/repositories/page-config.repository";
import { DEFAULT_PAGE_CONFIG } from "@/types/page-config";
import { AppearanceEditor } from "@/components/appearance/AppearanceEditor";

export const metadata: Metadata = { title: "Aparência" };

export default async function AppearancePage() {
  const session = await auth();
  const business = await getBusinessByUserId(session!.user.id);
  if (!business) redirect("/business");

  const saved = await getPageConfig(business.id);
  const config = saved ?? { id: "", businessId: business.id, ...DEFAULT_PAGE_CONFIG };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-bold text-white leading-tight">Aparência</h1>
        <p className="text-sm mt-1" style={{ color: "#71717a" }}>
          Personalize a página pública da sua barbearia.
        </p>
      </div>
      <AppearanceEditor
        initialConfig={config}
        businessSlug={business.slug}
        businessName={business.name}
        businessBio={business.bio}
        businessAddress={business.address}
        businessPhone={business.phone}
      />
    </div>
  );
}
