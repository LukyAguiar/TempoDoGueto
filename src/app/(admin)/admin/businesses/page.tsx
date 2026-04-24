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
        <h1 className="text-2xl font-bold text-slate-900">Barbearias</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {businesses.length} barbearia(s) na plataforma
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Barbearia
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Proprietário
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Uso
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cadastro
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {businesses.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                  Nenhuma barbearia cadastrada ainda.
                </td>
              </tr>
            )}
            {businesses.map((biz) => (
              <tr key={biz.id} className="hover:bg-slate-50 transition-colors">
                {/* Nome + slug */}
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900">{biz.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <a
                      href={`/${biz.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-600 hover:underline"
                    >
                      /{biz.slug}
                    </a>
                    {/* Client component para copiar — evita erro de onClick em Server Component */}
                    <CopyLinkButton slug={biz.slug} />
                  </div>
                </td>

                {/* Proprietário */}
                <td className="px-5 py-4">
                  <p className="text-slate-700">{biz.user.name}</p>
                  <p className="text-slate-400 text-xs">{biz.user.email}</p>
                </td>

                {/* Uso */}
                <td className="px-5 py-4">
                  <p className="text-slate-700">
                    <span className="font-semibold">{biz._count.appointments}</span>{" "}
                    <span className="text-slate-400 text-xs">agendamentos</span>
                  </p>
                  <p className="text-slate-400 text-xs">
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
                <td className="px-5 py-4 text-slate-500 text-xs">
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
