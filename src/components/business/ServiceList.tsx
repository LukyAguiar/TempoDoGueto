"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs" style={{ color: "#52525b" }}>
          {services.length} serviço(s)
        </p>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
          style={{ backgroundColor: "#f6b914", color: "#0a0a0a" }}
        >
          <Plus size={13} />
          Novo serviço
        </button>
      </div>

      {/* Form de criação */}
      {showForm && !editingId && (
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(246,185,20,0.3)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Novo serviço</h3>
            <button onClick={() => setShowForm(false)} style={{ color: "#52525b" }}>
              <X size={16} />
            </button>
          </div>
          <ServiceForm onSuccess={handleSuccess} />
        </div>
      )}

      {/* Vazio */}
      {services.length === 0 && !showForm && (
        <div
          className="text-center py-10 text-sm rounded-xl"
          style={{ border: "2px dashed rgba(255,255,255,0.08)", color: "#52525b" }}
        >
          Nenhum serviço cadastrado ainda.
        </div>
      )}

      {/* Lista */}
      {services.map((service) => (
        <div key={service.id}>
          {editingId === service.id ? (
            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(246,185,20,0.3)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Editar serviço</h3>
                <button onClick={() => setEditingId(null)} style={{ color: "#52525b" }}>
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
              className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    service.isActive ? "bg-green-500" : "bg-zinc-600"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-white">{service.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#71717a" }}>
                    {service.durationMinutes} min
                    {service.price != null && ` · ${formatCurrency(Number(service.price))}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditingId(service.id); setShowForm(false); }}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: "#52525b" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f6b914")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#52525b")}
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  disabled={deletingId === service.id}
                  className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                  style={{ color: "#52525b" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#52525b")}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
