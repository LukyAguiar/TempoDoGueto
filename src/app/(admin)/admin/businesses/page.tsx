import type { Metadata } from "next";
import { getAllBusinesses } from "@/server/repositories/admin.repository";
import { BusinessToggle } from "@/components/admin/BusinessToggle";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { formatDateDisplay } from "@/lib/dates";

export const metadata: Metadata = { title: "Admin — Barbearias" };

export default async function AdminBusinessesPage() {
  const businesses = await getAllBusinesses();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Barbearias</h1>
        <p className="text-sm mt-0.5" style={{color:"#71717a"}}>
          {businesses.length} barbearia(s) na plataforma
        </p>
      </div>

      <div className="rounded-2xl overflow-visible" style={{backgroundColor:"#1a1a1a",border:"1px solid rgba(255,255,255,0.06)"}}>
        <table className="w-full text-sm">
          <thead>
            <tr className="" style={{borderBottom:"1px solid rgba(255,255,255,0.06)",backgroundColor:"rgba(255,255,255,0.03)"}}>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#52525b" }}>
                Barbearia
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#52525b" }}>
                Proprietário
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#52525b" }}>
                Uso
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#52525b" }}>
                Status
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#52525b" }}>
                Cadastro
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="">
            {businesses.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-sm" style={{color:"#52525b"}}>
                  Nenhuma barbearia cadastrada ainda.
                </td>
              </tr>
            )}
            {businesses.map((biz) => (
              <tr key={biz.id} className="transition-colors" style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                {/* Nome + slug */}
                <td className="px-5 py-4">
                  <p className="font-medium text-white">{biz.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <a
                      href={`/${biz.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs hover:underline" style={{color:"#f6b914"}}
                    >
                      /{biz.slug}
                    </a>
                    {/* Client component para copiar — evita erro de onClick em Server Component */}
                    <CopyLinkButton slug={biz.slug} />
                  </div>
                </td>

                {/* Proprietário */}
                <td className="px-5 py-4">
                  <p className="" style={{color:"#d4d4d8"}}>{biz.user.name}</p>
                  <p className="text-xs" style={{color:"#52525b"}}>{biz.user.email}</p>
                </td>

                {/* Uso */}
                <td className="px-5 py-4">
                  <p className="" style={{color:"#d4d4d8"}}>
                    <span className="font-semibold">{biz._count.appointments}</span>{" "}
                    <span className="text-xs" style={{color:"#52525b"}}>agendamentos</span>
                  </p>
                  <p className="text-xs" style={{color:"#52525b"}}>
                    {biz._count.services} serviço(s)
                  </p>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      biz.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        biz.isActive ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    {biz.isActive ? "Ativa" : "Inativa"}
                  </span>
                </td>

                {/* Cadastro */}
                <td className="px-5 py-4 text-xs" style={{color:"#71717a"}}>
                  {formatDateDisplay(biz.createdAt.toISOString().split("T")[0])}
                </td>

                {/* Ações */}
                <td className="px-5 py-4 text-right">
                  <BusinessToggle businessId={biz.id} isActive={biz.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
