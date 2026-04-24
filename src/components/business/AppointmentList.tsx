"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, CheckCheck } from "lucide-react";
import { changeAppointmentStatus } from "@/server/actions/appointment";
import { formatDateDisplay } from "@/lib/dates";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
} from "@/types";
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

type Props = {
  appointments: Appointment[];
};

export function AppointmentList({ appointments }: Props) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleStatus(
    id: string,
    status: "CONFIRMED" | "CANCELED" | "COMPLETED"
  ) {
    setLoadingId(id);
    await changeAppointmentStatus(id, status);
    setLoadingId(null);
    router.refresh();
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
        Nenhum agendamento encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((appt) => {
        const dateStr = new Date(appt.date).toISOString().split("T")[0];
        const isLoading = loadingId === appt.id;

        return (
          <div
            key={appt.id}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Info principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-slate-900">
                    {appt.customerName}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      APPOINTMENT_STATUS_COLORS[appt.status]
                    }`}
                  >
                    {APPOINTMENT_STATUS_LABELS[appt.status]}
                  </span>
                </div>

                <p className="text-sm text-slate-500">
                  {appt.service.name} · {appt.startTime}–{appt.endTime}
                </p>
                <p className="text-sm text-slate-500">
                  {formatDateDisplay(dateStr)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {appt.customerPhone}
                </p>
                {appt.notes && (
                  <p className="text-xs text-slate-400 mt-1 italic">
                    "{appt.notes}"
                  </p>
                )}
              </div>

              {/* Ações */}
              {appt.status !== "CANCELED" && appt.status !== "COMPLETED" && (
                <div className="flex gap-1.5 shrink-0">
                  {appt.status === "PENDING" && (
                    <button
                      onClick={() => handleStatus(appt.id, "CONFIRMED")}
                      disabled={isLoading}
                      title="Confirmar"
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  {appt.status === "CONFIRMED" && (
                    <button
                      onClick={() => handleStatus(appt.id, "COMPLETED")}
                      disabled={isLoading}
                      title="Marcar como concluído"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleStatus(appt.id, "CANCELED")}
                    disabled={isLoading}
                    title="Cancelar"
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
