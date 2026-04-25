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

type Props = { blockedSlots: BlockedSlot[] };

export function BlockedSlotManager({ blockedSlots }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<BlockedSlotInput>({ resolver: zodResolver(blockedSlotSchema) });

  async function onSubmit(data: BlockedSlotInput) {
    setServerError(null);
    const result = await saveBlockedSlot(data);
    if (!result.success) { setServerError(result.error); return; }
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "#52525b" }}>
          {blockedSlots.length} bloqueio(s)
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ backgroundColor: "#f6b914", color: "#0a0a0a" }}
        >
          <Plus size={13} /> Bloquear horário
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(246,185,20,0.3)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Novo bloqueio</h3>
            <button onClick={() => setShowForm(false)} style={{ color: "#52525b" }}><X size={16} /></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {serverError && <p className="text-xs" style={{ color: "#ef4444" }}>{serverError}</p>}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input label="Data" type="date" error={errors.date?.message} {...register("date")} />
              <Input label="Início" type="time" error={errors.startTime?.message} {...register("startTime")} />
              <Input label="Fim" type="time" error={errors.endTime?.message} {...register("endTime")} />
            </div>
            <Input label="Motivo (opcional)" placeholder="Almoço, reunião..." {...register("reason")} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" size="sm" loading={isSubmitting}>Bloquear</Button>
            </div>
          </form>
        </div>
      )}

      {blockedSlots.length === 0 && !showForm && (
        <div className="text-center py-8 text-sm rounded-xl" style={{ border: "2px dashed rgba(255,255,255,0.08)", color: "#52525b" }}>
          Nenhum horário bloqueado.
        </div>
      )}

      {blockedSlots.map((slot) => (
        <div
          key={slot.id}
          className="flex flex-col gap-3 rounded-2xl px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div>
            <p className="text-sm font-medium text-white">
              {formatDateDisplay(new Date(slot.date).toISOString().split("T")[0])}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#71717a" }}>
              {slot.startTime} – {slot.endTime}{slot.reason && ` · ${slot.reason}`}
            </p>
          </div>
          <button
            onClick={() => handleDelete(slot.id)}
            disabled={deletingId === slot.id}
            className="self-start rounded-xl p-2 transition-colors hover:bg-red-500/10 disabled:opacity-50 sm:self-auto"
            style={{ color: "#52525b" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#52525b")}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
