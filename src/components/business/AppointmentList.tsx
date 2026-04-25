"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, CheckCheck, ChevronRight } from "lucide-react";
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
  PENDING:   "bg-yellow-400",
  CONFIRMED: "bg-green-500",
  CANCELED:  "bg-red-500",
  COMPLETED: "bg-blue-500",
};

const STATUS_BADGE: Record<AppointmentStatus, { bg: string; text: string }> = {
  PENDING:   { bg: "rgba(234,179,8,0.15)",  text: "#f6b914" },
  CONFIRMED: { bg: "rgba(34,197,94,0.15)",  text: "#22c55e" },
  CANCELED:  { bg: "rgba(239,68,68,0.15)",  text: "#ef4444" },
  COMPLETED: { bg: "rgba(59,130,246,0.15)", text: "#60a5fa" },
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
        className="text-center py-16 text-sm rounded-2xl"
        style={{
          border: "2px dashed rgba(255,255,255,0.08)",
          color: "#52525b",
        }}
      >
        Nenhum agendamento encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {appointments.map((appt) => {
        const dateStr = new Date(appt.date).toISOString().split("T")[0];
        const isLoading = loadingId === appt.id;
        const badge = STATUS_BADGE[appt.status];

        return (
          <div
            key={appt.id}
            className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Dot de status */}
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_DOT[appt.status]}`} />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-white text-sm">{appt.customerName}</p>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "#71717a" }}>
                {appt.service.name} · {appt.startTime}–{appt.endTime}
              </p>
              <p className="text-xs" style={{ color: "#52525b" }}>
                {formatDateDisplay(dateStr)}
              </p>
            </div>

            {/* Badge status */}
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold shrink-0"
              style={{ backgroundColor: badge.bg, color: badge.text }}
            >
              {APPOINTMENT_STATUS_LABELS[appt.status]}
            </span>

            {/* Ações */}
            {appt.status !== "CANCELED" && appt.status !== "COMPLETED" && (
              <div className="flex gap-1 shrink-0">
                {appt.status === "PENDING" && (
                  <button
                    onClick={() => handleStatus(appt.id, "CONFIRMED")}
                    disabled={isLoading}
                    title="Confirmar"
                    className="p-1.5 rounded-lg disabled:opacity-50 transition-colors"
                    style={{ color: "#22c55e" }}
                  >
                    <Check size={15} />
                  </button>
                )}
                {appt.status === "CONFIRMED" && (
                  <button
                    onClick={() => handleStatus(appt.id, "COMPLETED")}
                    disabled={isLoading}
                    title="Concluir"
                    className="p-1.5 rounded-lg disabled:opacity-50 transition-colors"
                    style={{ color: "#60a5fa" }}
                  >
                    <CheckCheck size={15} />
                  </button>
                )}
                <button
                  onClick={() => handleStatus(appt.id, "CANCELED")}
                  disabled={isLoading}
                  title="Cancelar"
                  className="p-1.5 rounded-lg disabled:opacity-50 transition-colors"
                  style={{ color: "#ef4444" }}
                >
                  <X size={15} />
                </button>
              </div>
            )}

            <ChevronRight size={14} style={{ color: "#3f3f46" }} className="shrink-0" />
          </div>
        );
      })}
    </div>
  );
}
