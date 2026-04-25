import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getBusinessByUserId } from "@/server/repositories/business.repository";
import { getAppointmentsByBusiness } from "@/server/repositories/appointment.repository";
import { AppointmentList } from "@/components/business/AppointmentList";
import type { AppointmentStatus } from "@prisma/client";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Agendamentos" };

type Props = {
  searchParams: { status?: string; period?: string };
};

const STATUS_OPTIONS = [
  { value: "upcoming", label: "Próximos" },
  { value: "all",      label: "Todos" },
  { value: "PENDING",  label: "Pendentes" },
  { value: "CONFIRMED",label: "Confirmados" },
  { value: "COMPLETED",label: "Concluídos" },
  { value: "CANCELED", label: "Cancelados" },
];

export default async function AppointmentsPage({ searchParams }: Props) {
  const session = await auth();
  const business = await getBusinessByUserId(session!.user.id);
  if (!business) redirect("/business");

  const statusFilter = searchParams.status as AppointmentStatus | undefined;
  const periodFilter = searchParams.period ?? "upcoming";
  const fromDate = periodFilter === "upcoming" ? new Date() : undefined;

  const appointments = await getAppointmentsByBusiness(business.id, {
    status: statusFilter && !["upcoming","all"].includes(statusFilter)
      ? statusFilter
      : undefined,
    fromDate,
  });

  const cardStyle = {
    backgroundColor: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.06)",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Agendamentos</h1>
          <p className="text-sm mt-0.5" style={{ color: "#71717a" }}>
            Gerencie os agendamentos do seu negócio.
          </p>
        </div>
        {/* Botão de novo agendamento (futuro) */}
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
          style={{ backgroundColor: "#f6b914", color: "#0a0a0a" }}
        >
          <Plus size={15} />
          Novo agendamento
        </button>
      </div>

      {/* Filtros por tab */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_OPTIONS.map((opt) => {
          const isActive =
            opt.value === "upcoming"
              ? periodFilter === "upcoming" && !statusFilter
              : opt.value === "all"
              ? periodFilter === "all" && !statusFilter
              : statusFilter === opt.value;

          const href =
            opt.value === "upcoming"
              ? "/appointments?period=upcoming"
              : opt.value === "all"
              ? "/appointments?period=all"
              : `/appointments?period=${periodFilter}&status=${opt.value}`;

          return (
            <a
              key={opt.value}
              href={href}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
              style={
                isActive
                  ? { backgroundColor: "#f6b914", color: "#0a0a0a" }
                  : {
                      backgroundColor: "rgba(255,255,255,0.05)",
                      color: "#71717a",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }
              }
            >
              {opt.label}
            </a>
          );
        })}
      </div>

      {/* Lista */}
      <div className="rounded-2xl p-4" style={cardStyle}>
        <AppointmentList appointments={appointments} />
      </div>
    </div>
  );
}
