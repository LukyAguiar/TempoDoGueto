import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getBusinessByUserId } from "@/server/repositories/business.repository";
import { getAppointmentsByBusiness } from "@/server/repositories/appointment.repository";
import { AppointmentList } from "@/components/business/AppointmentList";
import type { AppointmentStatus } from "@prisma/client";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Agendamentos" };

type Props = { searchParams: { status?: string; period?: string } };

const STATUS_OPTIONS = [
  { value: "upcoming", label: "Próximos" },
  { value: "all", label: "Todos" },
  { value: "PENDING", label: "Pendentes" },
  { value: "CONFIRMED", label: "Confirmados" },
  { value: "COMPLETED", label: "Concluídos" },
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
    status: statusFilter && !["upcoming", "all"].includes(statusFilter) ? statusFilter : undefined,
    fromDate,
  });

  const cardStyle = { backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)" };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agendamentos</h1>
          <p className="mt-1 text-sm" style={{ color: "#71717a" }}>
            Gerencie os agendamentos do seu negócio.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-transform active:scale-[0.98] sm:py-2.5"
          style={{ backgroundColor: "#f6b914", color: "#0a0a0a" }}
        >
          <Plus size={15} />
          Novo agendamento
        </button>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2 pb-1 sm:w-auto sm:flex-wrap">
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
                className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all"
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
      </div>

      <div className="rounded-3xl p-3 sm:p-4" style={cardStyle}>
        <AppointmentList appointments={appointments} />
      </div>
    </div>
  );
}
