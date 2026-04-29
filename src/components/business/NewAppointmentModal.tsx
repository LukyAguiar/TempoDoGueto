"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { appointmentSchema, type AppointmentInput } from "@/schemas/appointment";
import { bookAppointment } from "@/server/actions/appointment";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Service } from "@prisma/client";

type Props = {
  slug: string;
  services: Service[];
  onClose: () => void;
};

export function NewAppointmentModal({ slug, services, onClose }: Props) {
  const router = useRouter();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
  });

  const selectedServiceId = watch("serviceId");
  const selectedDate = watch("date");
  const selectedStartTime = watch("startTime");

  // Busca slots quando serviço e data são escolhidos
  useEffect(() => {
    if (!selectedServiceId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setAvailableSlots([]);
      setValue("startTime", "");
      try {
        const res = await fetch(
          `/api/slots?slug=${slug}&serviceId=${selectedServiceId}&date=${selectedDate}`
        );
        const data = await res.json();
        setAvailableSlots(data.slots ?? []);
      } catch {
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedServiceId, selectedDate, slug, setValue]);

  async function onSubmit(data: AppointmentInput) {
    setServerError(null);
    const result = await bookAppointment(slug, data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    setSuccessMsg(
      `Agendamento de ${result.confirmation.customerName} criado com sucesso!`
    );
    setTimeout(() => {
      router.refresh();
      onClose();
    }, 1500);
  }

  const activeServices = services.filter((s) => s.isActive);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} style={{ color: "#f6b914" }} />
            <h2 className="text-base font-bold text-white">Novo agendamento</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-white/5 transition-colors"
            style={{ color: "#71717a" }}
          >
            <X size={16} />
          </button>
        </div>

        {successMsg ? (
          <div
            className="rounded-2xl p-4 text-sm font-semibold text-center"
            style={{ backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" }}
          >
            {successMsg}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div
                className="rounded-xl p-3 text-xs"
                style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
              >
                {serverError}
              </div>
            )}

            {/* Serviço */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold" style={{ color: "#a1a1aa" }}>
                Serviço
              </label>
              {activeServices.length === 0 ? (
                <p className="text-xs" style={{ color: "#71717a" }}>
                  Nenhum serviço ativo cadastrado.
                </p>
              ) : (
                <select
                  {...register("serviceId")}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: errors.serviceId
                      ? "1px solid rgba(239,68,68,0.5)"
                      : "1px solid rgba(255,255,255,0.08)",
                    color: "#e4e4e7",
                  }}
                >
                  <option value="" style={{ backgroundColor: "#1a1a1a" }}>
                    Selecione um serviço
                  </option>
                  {activeServices.map((s) => (
                    <option key={s.id} value={s.id} style={{ backgroundColor: "#1a1a1a" }}>
                      {s.name} — {s.durationMinutes} min
                    </option>
                  ))}
                </select>
              )}
              {errors.serviceId && (
                <p className="text-xs" style={{ color: "#f87171" }}>
                  {errors.serviceId.message}
                </p>
              )}
            </div>

            {/* Data */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold" style={{ color: "#a1a1aa" }}>
                Data
              </label>
              <input
                type="date"
                {...register("date")}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: errors.date
                    ? "1px solid rgba(239,68,68,0.5)"
                    : "1px solid rgba(255,255,255,0.08)",
                  color: "#e4e4e7",
                  colorScheme: "dark",
                }}
              />
              {errors.date && (
                <p className="text-xs" style={{ color: "#f87171" }}>
                  {errors.date.message}
                </p>
              )}
            </div>

            {/* Horário */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold" style={{ color: "#a1a1aa" }}>
                Horário disponível
              </label>
              {loadingSlots ? (
                <div className="flex items-center gap-2 text-xs py-2" style={{ color: "#71717a" }}>
                  <div
                    className="h-3.5 w-3.5 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "#f6b914", borderTopColor: "transparent" }}
                  />
                  Carregando horários...
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setValue("startTime", slot, { shouldValidate: true })}
                      className="rounded-xl py-2 px-1 text-xs font-semibold transition-all"
                      style={
                        selectedStartTime === slot
                          ? { backgroundColor: "#f6b914", color: "#0a0a0a" }
                          : {
                              backgroundColor: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              color: "#a1a1aa",
                            }
                      }
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : selectedServiceId && selectedDate ? (
                <p className="text-xs" style={{ color: "#71717a" }}>
                  Nenhum horário disponível neste dia.
                </p>
              ) : (
                <p className="text-xs" style={{ color: "#71717a" }}>
                  Selecione um serviço e uma data.
                </p>
              )}
              {/* Campo oculto para startTime */}
              <input type="hidden" {...register("startTime")} />
              {errors.startTime && (
                <p className="text-xs" style={{ color: "#f87171" }}>
                  Selecione um horário
                </p>
              )}
            </div>

            {/* Dados do cliente */}
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-xs font-semibold" style={{ color: "#71717a" }}>
                Dados do cliente
              </p>
              <Input
                label="Nome"
                placeholder="João Silva"
                error={errors.customerName?.message}
                {...register("customerName")}
              />
              <Input
                label="Telefone / WhatsApp"
                placeholder="(11) 99999-9999"
                error={errors.customerPhone?.message}
                {...register("customerPhone")}
              />
              <Input
                label="Observações (opcional)"
                placeholder="Ex: preferência de profissional..."
                {...register("notes")}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#71717a",
                }}
              >
                Cancelar
              </button>
              <div className="flex-1">
                <Button type="submit" className="w-full" loading={isSubmitting}>
                  Criar agendamento
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
