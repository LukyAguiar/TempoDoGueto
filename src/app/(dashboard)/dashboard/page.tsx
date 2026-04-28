import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { getBusinessByUserId } from "@/server/repositories/business.repository";
import { prisma } from "@/lib/prisma/client";
import { formatDateDisplay } from "@/lib/dates";
import { APPOINTMENT_STATUS_LABELS } from "@/types";
import { CalendarDays, Clock, CheckCircle } from "lucide-react";
import type { AppointmentStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const business = await getBusinessByUserId(session!.user.id);

  if (!business) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Olá, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="mb-6" style={{ color: "#71717a" }}>
          Para começar, cadastre seu negócio.
        </p>
        <Link
          href="/business"
          className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
          style={{ backgroundColor: "#f6b914", color: "#0a0a0a" }}
        >
          Cadastrar negócio →
        </Link>
      </div>
    );
  }

  // Início e fim do dia em UTC para evitar bug de timezone no Prisma
  const now = new Date();
  const todayStart = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  );
  const todayEnd = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  );

  const [todayAppts, pendingCount, upcomingAppts] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        businessId: business.id,
        date: { gte: todayStart, lte: todayEnd },
        status: { not: "CANCELED" },
      },
      include: { service: { select: { name: true } } },
      orderBy: { startTime: "asc" },
    }),
    prisma.appointment.count({
      where: {
        businessId: business.id,
        status: "PENDING",
        date: { gte: todayStart },
      },
    }),
    prisma.appointment.findMany({
      where: {
        businessId: business.id,
        date: { gte: todayStart },
        status: { notIn: ["CANCELED", "COMPLETED"] },
      },
      include: { service: { select: { name: true } } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 5,
    }),
  ]);

  const confirmedCount = upcomingAppts.filter(
    (a) => a.status === "CONFIRMED"
  ).length;

  const metrics = [
    { label: "Agendamentos hoje", value: todayAppts.length,  icon: CalendarDays },
    { label: "Pendentes (futuros)", value: pendingCount,      icon: Clock },
    { label: "Próximos confirmados", value: confirmedCount,  icon: CheckCircle },
  ];

  const cardStyle = {
    backgroundColor: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.06)",
  };

  const statusBadgeStyle: Record<AppointmentStatus, CSSProperties> = {
    PENDING: { backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid rgba(250,204,21,0.65)" },
    CONFIRMED: { backgroundColor: "#dcfce7", color: "#166534", border: "1px solid rgba(34,197,94,0.35)" },
    CANCELED: { backgroundColor: "#fee2e2", color: "#991b1b", border: "1px solid rgba(239,68,68,0.35)" },
    COMPLETED: { backgroundColor: "#dbeafe", color: "#1e40af", border: "1px solid rgba(59,130,246,0.35)" },
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pt-2 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Olá, {session?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "#71717a" }}>
            Página pública:{" "}
            <a
              href={`/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#f6b914" }}
              className="hover:underline"
            >
              /{business.slug}
            </a>
          </p>
        </div>

        <a
          href={`/${business.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors hover:bg-yellow-400/10"
          style={{ borderColor: "#f6b914", color: "#f6b914" }}
        >
          Ver página pública →
        </a>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="rounded-2xl p-5 flex items-center gap-4" style={cardStyle}>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(246,185,20,0.15)" }}
              >
                <Icon size={22} style={{ color: "#f6b914" }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: "#71717a" }}>{m.label}</p>
                <p className="text-3xl font-bold text-white mt-0.5">{m.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agenda de hoje */}
      <div className="rounded-2xl p-6 mb-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Agenda de hoje</h2>
            <div className="mt-1 h-0.5 w-8 rounded" style={{ backgroundColor: "#f6b914" }} />
          </div>
          <Link href="/appointments" className="text-sm font-medium hover:underline" style={{ color: "#f6b914" }}>
            Ver todos →
          </Link>
        </div>

        {todayAppts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3 opacity-20">📅</div>
            <p className="font-semibold text-white text-sm">Nenhum agendamento para hoje.</p>
            <p className="text-xs mt-1" style={{ color: "#52525b" }}>
              Quando clientes agendarem, eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayAppts.map((appt) => (
              <div
                key={appt.id}
                className="flex items-center justify-between py-3 px-4 rounded-xl"
                style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {appt.startTime} – {appt.endTime} · {appt.customerName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#71717a" }}>
                    {appt.service.name}
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-semibold shrink-0"
                  style={statusBadgeStyle[appt.status as AppointmentStatus]}>
                  {APPOINTMENT_STATUS_LABELS[appt.status as AppointmentStatus]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Próximos agendamentos */}
      {upcomingAppts.length > 0 && (
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h2 className="text-base font-bold text-white mb-4">Próximos agendamentos</h2>
          <div className="space-y-2">
            {upcomingAppts.map((appt) => {
              const dateStr = new Date(appt.date).toISOString().split("T")[0];
              return (
                <div
                  key={appt.id}
                  className="flex items-center justify-between py-3 px-4 rounded-xl"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {appt.customerName} · {appt.service.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#71717a" }}>
                      {formatDateDisplay(dateStr)} às {appt.startTime}
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full font-semibold shrink-0"
                    style={statusBadgeStyle[appt.status as AppointmentStatus]}>
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
