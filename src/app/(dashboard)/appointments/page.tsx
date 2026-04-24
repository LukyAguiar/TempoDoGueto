import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getBusinessByUserId } from "@/server/repositories/business.repository";
import { getAppointmentsByBusiness } from "@/server/repositories/appointment.repository";
import { AppointmentList } from "@/components/business/AppointmentList";
import type { AppointmentStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Agendamentos" };

type Props = {
  searchParams: { status?: string; period?: string };
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
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

  const fromDate =
    periodFilter === "upcoming" ? new Date() : undefined;

  const appointments = await getAppointmentsByBusiness(business.id, {
    status: statusFilter && statusFilter !== ("all" as string) ? statusFilter : undefined,
    fromDate,
  });

  const counts = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "PENDING").length,
    confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Agendamentos</h1>
      <p className="text-slate-500 mb-6">
        Gerencie os agendamentos do seu negócio.
      </p>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-6 max-w-lg">
        {[
          { label: "Total", value: counts.total },
          { label: "Pendentes", value: counts.pending },
          { label: "Confirmados", value: counts.confirmed },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500">{m.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* Período */}
        {[
          { value: "upcoming", label: "Próximos" },
          { value: "all", label: "Todos os períodos" },
        ].map((opt) => (
          <a
            key={opt.value}
            href={`/appointments?period=${opt.value}${statusFilter ? `&status=${statusFilter}` : ""}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              periodFilter === opt.value
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
            }`}
          >
            {opt.label}
          </a>
        ))}

        <span className="w-px bg-slate-200 mx-1" />

        {/* Status */}
        {STATUS_OPTIONS.map((opt) => {
          const isActive =
            opt.value === "all"
              ? !statusFilter || statusFilter === ("all" as string)
              : statusFilter === opt.value;
          return (
            <a
              key={opt.value}
              href={`/appointments?period=${periodFilter}&status=${opt.value}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                isActive
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-brand-300"
              }`}
            >
              {opt.label}
            </a>
          );
        })}
      </div>

      {/* Lista */}
      <div className="max-w-2xl">
        <AppointmentList appointments={appointments} />
      </div>
    </div>
  );
}
