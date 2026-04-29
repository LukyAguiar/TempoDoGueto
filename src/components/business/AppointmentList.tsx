"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, CheckCheck, CalendarDays, Clock, Phone, Scissors } from "lucide-react";
import { changeAppointmentStatus } from "@/server/actions/appointment";
import { formatDateDisplay } from "@/lib/dates";
import { APPOINTMENT_STATUS_LABELS } from "@/types";
import type { AppointmentStatus } from "@prisma/client";

type Appointment = {
  id: string;
  customerName: string;
  customerPhone: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  service: { name: string; durationMinutes: number };
};

type Props = { appointments: Appointment[] };

const STATUS_CONFIG: Record<AppointmentStatus, {
  dot: string;
  badgeClass: string;
  label: string;
  accentBorder: string;
}> = {
  PENDING: {
    dot: "#fbbf24",
    badgeClass: "badge badge-pending",
    label: "Pendente",
    accentBorder: "rgba(251,191,36,0.15)",
  },
  CONFIRMED: {
    dot: "#4ade80",
    badgeClass: "badge badge-confirmed",
    label: "Confirmado",
    accentBorder: "rgba(74,222,128,0.12)",
  },
  CANCELED: {
    dot: "#f87171",
    badgeClass: "badge badge-canceled",
    label: "Cancelado",
    accentBorder: "rgba(248,113,113,0.10)",
  },
  COMPLETED: {
    dot: "#818cf8",
    badgeClass: "badge badge-completed",
    label: "Concluído",
    accentBorder: "rgba(129,140,248,0.10)",
  },
};

export function AppointmentList({ appointments }: Props) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleStatus(id: string, status: "CONFIRMED" | "CANCELED" | "COMPLETED") {
    setLoadingId(id);
    await changeAppointmentStatus(id, status);
    setLoadingId(null);
    router.refresh();
  }

  if (appointments.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "rgba(246,185,20,0.07)", border: "1px solid rgba(246,185,20,0.12)" }}
        >
          <CalendarDays size={22} style={{ color: "#f6b914" }} />
        </div>
        <p className="text-sm font-bold text-white">Nenhum agendamento encontrado</p>
        <p className="mt-1.5 max-w-xs text-xs leading-relaxed" style={{ color: "#52525b" }}>
          Quando seus clientes agendarem pela página pública, eles vão aparecer aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {appointments.map((appt) => {
        const dateStr = new Date(appt.date).toISOString().split("T")[0];
        const isLoading = loadingId === appt.id;
        const cfg = STATUS_CONFIG[appt.status];
        const isDone = appt.status === "CANCELED" || appt.status === "COMPLETED";

        return (
          <div
            key={appt.id}
            className="group relative flex flex-col gap-4 rounded-[18px] p-4 transition-all duration-200 card-hover sm:flex-row sm:items-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              border: `1px solid ${cfg.accentBorder}`,
            }}
          >
            {/* Barra lateral colorida */}
            <div
              className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
              style={{ backgroundColor: cfg.dot, boxShadow: `0 0 8px ${cfg.dot}60` }}
            />

            {/* Info principal */}
            <div className="flex items-start gap-3 flex-1 min-w-0 pl-3">
              <div className="min-w-0 flex-1">
                {/* Nome + badge */}
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <p className="text-[15px] font-bold text-white leading-tight">
                    {appt.customerName}
                  </p>
                  <span className={cfg.badgeClass}>
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: cfg.dot, boxShadow: `0 0 4px ${cfg.dot}` }}
                    />
                    {APPOINTMENT_STATUS_LABELS[appt.status]}
                  </span>
                </div>

                {/* Serviço */}
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#a1a1aa" }}>
                    <Scissors size={12} style={{ color: "#f6b914" }} />
                    {appt.service.name}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "#71717a" }}>
                    <Clock size={12} />
                    {appt.startTime} – {appt.endTime}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "#71717a" }}>
                    <CalendarDays size={12} />
                    {formatDateDisplay(dateStr)}
                  </span>
                  {appt.customerPhone && (
                    <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "#71717a" }}>
                      <Phone size={12} />
                      {appt.customerPhone}
                    </span>
                  )}
                </div>

                {appt.notes && (
                  <p className="mt-2 text-xs italic rounded-lg px-2.5 py-1.5 inline-block"
                    style={{ color: "#71717a", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    "{appt.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Ações */}
            {!isDone && (
              <div className="flex gap-2 pl-3 sm:pl-0 sm:shrink-0">
                {appt.status === "PENDING" && (
                  <button
                    onClick={() => handleStatus(appt.id, "CONFIRMED")}
                    disabled={isLoading}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all disabled:opacity-50 sm:flex-none hover:scale-[1.02] active:scale-[0.97]"
                    style={{ color: "#4ade80", backgroundColor: "rgba(74,222,128,0.10)", border: "1px solid rgba(74,222,128,0.20)" }}
                  >
                    <Check size={13} /> Confirmar
                  </button>
                )}
                {appt.status === "CONFIRMED" && (
                  <button
                    onClick={() => handleStatus(appt.id, "COMPLETED")}
                    disabled={isLoading}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all disabled:opacity-50 sm:flex-none hover:scale-[1.02] active:scale-[0.97]"
                    style={{ color: "#818cf8", backgroundColor: "rgba(129,140,248,0.10)", border: "1px solid rgba(129,140,248,0.20)" }}
                  >
                    <CheckCheck size={13} /> Concluir
                  </button>
                )}
                <button
                  onClick={() => handleStatus(appt.id, "CANCELED")}
                  disabled={isLoading}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all disabled:opacity-50 sm:flex-none hover:scale-[1.02] active:scale-[0.97]"
                  style={{ color: "#f87171", backgroundColor: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.18)" }}
                >
                  <X size={13} /> Cancelar
                </button>
              </div>
            )}

            {isLoading && (
              <div className="absolute inset-0 rounded-[18px] flex items-center justify-center"
                style={{ backgroundColor: "rgba(13,13,13,0.6)", backdropFilter: "blur(2px)" }}>
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "#f6b914", borderTopColor: "transparent" }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
