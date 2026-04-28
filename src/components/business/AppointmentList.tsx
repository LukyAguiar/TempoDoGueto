"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, CheckCheck, CalendarDays } from "lucide-react";
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

const STATUS_DOT: Record<AppointmentStatus, string> = {
  PENDING: "bg-yellow-400",
  CONFIRMED: "bg-green-500",
  CANCELED: "bg-red-500",
  COMPLETED: "bg-blue-500",
};

const STATUS_BADGE: Record<AppointmentStatus, { bg: string; text: string }> = {
  PENDING: { bg: "#fef3c7", text: "#92400e" },
  CONFIRMED: { bg: "#dcfce7", text: "#166534" },
  CANCELED: { bg: "#fee2e2", text: "#991b1b" },
  COMPLETED: { bg: "#dbeafe", text: "#1e40af" },
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
        className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-14 text-center"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
          <CalendarDays size={24} style={{ color: "#52525b" }} />
        </div>
        <p className="text-sm font-semibold text-white">Nenhum agendamento encontrado</p>
        <p className="mt-1 max-w-xs text-xs" style={{ color: "#71717a" }}>
          Quando seus clientes agendarem pela página pública, eles vão aparecer aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((appt) => {
        const dateStr = new Date(appt.date).toISOString().split("T")[0];
        const isLoading = loadingId === appt.id;
        const badge = STATUS_BADGE[appt.status];

        return (
          <div
            key={appt.id}
            className="flex flex-col gap-3 rounded-2xl px-4 py-4 transition-all hover:bg-white/[0.06] sm:flex-row sm:items-center sm:gap-4"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[appt.status]}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold text-white">{appt.customerName}</p>
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{ backgroundColor: badge.bg, color: badge.text }}
                  >
                    {APPOINTMENT_STATUS_LABELS[appt.status]}
                  </span>
                </div>
                <p className="mt-1 text-sm" style={{ color: "#a1a1aa" }}>
                  {appt.service.name} · {appt.startTime}–{appt.endTime}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: "#71717a" }}>
                  {formatDateDisplay(dateStr)} {appt.customerPhone && `· ${appt.customerPhone}`}
                </p>
              </div>
            </div>

            {appt.status !== "CANCELED" && appt.status !== "COMPLETED" && (
              <div className="flex gap-2 sm:shrink-0">
                {appt.status === "PENDING" && (
                  <button
                    onClick={() => handleStatus(appt.id, "CONFIRMED")}
                    disabled={isLoading}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 sm:flex-none"
                    style={{ color: "#22c55e", backgroundColor: "rgba(34,197,94,0.1)" }}
                  >
                    <Check size={14} /> Confirmar
                  </button>
                )}
                {appt.status === "CONFIRMED" && (
                  <button
                    onClick={() => handleStatus(appt.id, "COMPLETED")}
                    disabled={isLoading}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 sm:flex-none"
                    style={{ color: "#60a5fa", backgroundColor: "rgba(59,130,246,0.1)" }}
                  >
                    <CheckCheck size={14} /> Concluir
                  </button>
                )}
                <button
                  onClick={() => handleStatus(appt.id, "CANCELED")}
                  disabled={isLoading}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 sm:flex-none"
                  style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)" }}
                >
                  <X size={14} /> Cancelar
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
