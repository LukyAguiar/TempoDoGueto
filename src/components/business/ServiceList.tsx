"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import type { Service } from "@prisma/client";
import { removeService } from "@/server/actions/service";
import { ServiceForm } from "@/components/forms/ServiceForm";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Props = {
  services: Service[];
};

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

  const editingService = services.find((s) => s.id === editingId);

  return (
    <div className="space-y-4">
      {/* Header com botão de adicionar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{services.length} serviço(s) cadastrado(s)</p>
        <Button
          size="sm"
          onClick={() => { setShowForm(true); setEditingId(null); }}
        >
          <Plus size={16} />
          Novo serviço
        </Button>
      </div>

      {/* Formulário de criação */}
      {showForm && !editingId && (
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Novo serviço</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          </div>
          <ServiceForm onSuccess={handleSuccess} />
        </div>
      )}

      {/* Lista de serviços */}
      {services.length === 0 && !showForm && (
        <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
          Nenhum serviço cadastrado ainda.
        </div>
      )}

      {services.map((service) => (
        <div key={service.id} className="border border-slate-200 rounded-lg p-4 bg-white">
          {editingId === service.id ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Editar serviço</h3>
                <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600">
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
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    service.isActive ? "bg-green-500" : "bg-slate-300"
                  }`}
                />
                <div>
                  <p className="font-medium text-slate-900">{service.name}</p>
                  <p className="text-sm text-slate-500">
                    {service.durationMinutes} min
                    {service.price != null && ` · ${formatCurrency(Number(service.price))}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setEditingId(service.id); setShowForm(false); }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  disabled={deletingId === service.id}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
