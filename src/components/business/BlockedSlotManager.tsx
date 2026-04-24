"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, Plus, X } from "lucide-react";
import type { BlockedSlot } from "@prisma/client";
import { blockedSlotSchema, type BlockedSlotInput } from "@/schemas/appointment";
import { saveBlockedSlot, removeBlockedSlot } from "@/server/actions/availability";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatDateDisplay } from "@/lib/dates";

type Props = {
  blockedSlots: BlockedSlot[];
};

export function BlockedSlotManager({ blockedSlots }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BlockedSlotInput>({
    resolver: zodResolver(blockedSlotSchema),
  });

  async function onSubmit(data: BlockedSlotInput) {
    setServerError(null);
    const result = await saveBlockedSlot(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    reset();
    setShowForm(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await removeBlockedSlot(id);
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {blockedSlots.length} bloqueio(s) ativo(s)
        </p>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Bloquear horário
        </Button>
      </div>

      {/* Formulário de bloqueio */}
      {showForm && (
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Novo bloqueio
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {serverError && (
              <p className="text-xs text-red-500">{serverError}</p>
            )}
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Data"
                type="date"
                error={errors.date?.message}
                {...register("date")}
              />
              <Input
                label="Início"
                type="time"
                error={errors.startTime?.message}
                {...register("startTime")}
              />
              <Input
                label="Fim"
                type="time"
                error={errors.endTime?.message}
                {...register("endTime")}
              />
            </div>
            <Input
              label="Motivo (opcional)"
              placeholder="Almoço, reunião..."
              {...register("reason")}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" loading={isSubmitting}>
                Bloquear
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de bloqueios */}
      {blockedSlots.length === 0 && !showForm && (
        <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
          Nenhum horário bloqueado.
        </div>
      )}

      {blockedSlots.map((slot) => (
        <div
          key={slot.id}
          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white"
        >
          <div>
            <p className="text-sm font-medium text-slate-900">
              {formatDateDisplay(
                new Date(slot.date).toISOString().split("T")[0]
              )}
            </p>
            <p className="text-xs text-slate-500">
              {slot.startTime} – {slot.endTime}
              {slot.reason && ` · ${slot.reason}`}
            </p>
          </div>
          <button
            onClick={() => handleDelete(slot.id)}
            disabled={deletingId === slot.id}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
