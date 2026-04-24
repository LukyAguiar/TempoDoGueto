import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { getBusinessByUserId } from "@/server/repositories/business.repository";
import { prisma } from "@/lib/prisma/client";
import { formatDateDisplay } from "@/lib/dates";
import { APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS } from "@/types";
import type { AppointmentStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const business = await getBusinessByUserId(session!.user.id);

  if (!business) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Olá, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 mb-6">
          Para começar, cadastre seu negócio.
        </p>
        <Link
          href="/business"
          className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Cadastrar negócio →
        </Link>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayISO = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const [todayAppts, pendingCount, upcomingAppts] = await Promise.all([
    // Agendamentos de hoje
    prisma.appointment.findMany({
      where: {
        businessId: business.id,
        date: todayISO,
        status: { not: "CANCELED" },
      },
      include: { service: { select: { name: true } } },
      orderBy: { startTime: "asc" },
    }),
    // Total de pendentes
    prisma.appointment.count({
      where: {
        businessId: business.id,
        status: "PENDING",
        date: { gte: todayISO },
      },
    }),
    // Próximos 5 agendamentos
    prisma.appointment.findMany({
      where: {
        businessId: business.id,
        date: { gte: todayISO },
        status: { notIn: ["CANCELED", "COMPLETED"] },
      },
      include: { service: { select: { name: true } } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 5,
    }),
  ]);

  const metrics = [
    { label: "Agendamentos hoje", value: todayAppts.length },
    { label: "Pendentes (futuros)", value: pendingCount },
    { label: "Próximos confirmados", value: upcomingAppts.filter((a) => a.status === "CONFIRMED").length },
  ];

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Olá, {session?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm">
            Página pública:{" "}
            <a
              href={`/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline"
            >
              /{business.slug}
            </a>
          </p>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <p className="text-sm text-slate-500">{m.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Agenda de hoje */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Agenda de hoje
          </h2>
          <Link href="/appointments" className="text-sm text-brand-600 hover:underline">
            Ver todos →
          </Link>
        </div>

        {todayAppts.length === 0 ? (
          <p className="text-slate-400 text-sm">Nenhum agendamento para hoje.</p>
        ) : (
          <div className="space-y-2">
            {todayAppts.map((appt) => (
              <div
                key={appt.id}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {appt.startTime} – {appt.endTime} · {appt.customerName}
                  </p>
                  <p className="text-xs text-slate-500">{appt.service.name}</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    APPOINTMENT_STATUS_COLORS[appt.status as AppointmentStatus]
                  }`}
                >
                  {APPOINTMENT_STATUS_LABELS[appt.status as AppointmentStatus]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Próximos agendamentos */}
      {upcomingAppts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Próximos agendamentos
          </h2>
          <div className="space-y-2">
            {upcomingAppts.map((appt) => {
              const dateStr = new Date(appt.date).toISOString().split("T")[0];
              return (
                <div
                  key={appt.id}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {appt.customerName} · {appt.service.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDateDisplay(dateStr)} às {appt.startTime}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      APPOINTMENT_STATUS_COLORS[appt.status as AppointmentStatus]
                    }`}
                  >
                    {APPOINTMENT_STATUS_LABELS[appt.status as AppointmentStatus]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
