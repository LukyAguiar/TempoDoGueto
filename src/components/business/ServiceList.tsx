"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, X, Scissors } from "lucide-react";
import type { Service } from "@prisma/client";
import { removeService } from "@/server/actions/service";
import { ServiceForm } from "@/components/forms/ServiceForm";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Props = { services: Service[] };

export function ServiceList({ services }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    await removeService(id);
    setDeletingId(null);
    router.refresh();
  }

  function handleSuccess() {
    setShowForm(false);
    setEditingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs" style={{ color: "#71717a" }}>
          {services.length} serviço(s) cadastrado(s)
        </p>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); }}
          className="inline-flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold transition-transform active:scale-[0.98]"
          style={{ backgroundColor: "#f6b914", color: "#0a0a0a" }}
        >
          <Plus size={13} />
          Novo serviço
        </button>
      </div>

      {showForm && !editingId && (
        <div className="rounded-2xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(246,185,20,0.3)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Novo serviço</h3>
            <button className="rounded-xl p-2 hover:bg-white/5" onClick={() => setShowForm(false)} style={{ color: "#71717a" }}>
              <X size={16} />
            </button>
          </div>
          <ServiceForm onSuccess={handleSuccess} />
        </div>
      )}

      {services.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-12 text-center" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
            <Scissors size={24} style={{ color: "#52525b" }} />
          </div>
          <p className="text-sm font-semibold text-white">Nenhum serviço cadastrado</p>
          <p className="mt-1 max-w-xs text-xs" style={{ color: "#71717a" }}>
            Cadastre serviços para que seus clientes possam escolher na página pública.
          </p>
        </div>
      )}

      {services.map((service) => (
        <div key={service.id}>
          {editingId === service.id ? (
            <div className="rounded-2xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(246,185,20,0.3)" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Editar serviço</h3>
                <button className="rounded-xl p-2 hover:bg-white/5" onClick={() => setEditingId(null)} style={{ color: "#71717a" }}>
                  <X size={16} />
                </button>
              </div>
              <ServiceForm
                serviceId={service.id}
                defaultValues={{
                  name: service.name,
                  durationMinutes: service.durationMinutes,
                  price: service.price ? String(service.price) : "",
                  isActive: service.isActive,
                }}
                onSuccess={handleSuccess}
              />
            </div>
          ) : (
            <div
              className="flex flex-col gap-3 rounded-2xl px-4 py-4 transition-all hover:bg-white/[0.06] sm:flex-row sm:items-center sm:justify-between"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${service.isActive ? "bg-green-500" : "bg-zinc-600"}`} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{service.name}</p>
                  <p className="mt-0.5 text-xs" style={{ color: "#71717a" }}>
                    {service.durationMinutes} min · {service.isActive ? "Ativo" : "Inativo"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                {service.price != null && (
                  <p className="rounded-full px-3 py-1 text-sm font-bold" style={{ color: "#f6b914", backgroundColor: "rgba(246,185,20,0.1)" }}>
                    {formatCurrency(Number(service.price))}
                  </p>
                )}
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingId(service.id); setShowForm(false); }} className="rounded-xl p-2 transition-colors hover:bg-white/5" style={{ color: "#71717a" }}>
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(service.id)} disabled={deletingId === service.id} className="rounded-xl p-2 transition-colors hover:bg-red-500/10 disabled:opacity-50" style={{ color: "#ef4444" }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
