import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { getBusinessByUserId } from "@/server/repositories/business.repository";
import { prisma } from "@/lib/prisma/client";
import { formatDateDisplay } from "@/lib/dates";
import { APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS } from "@/types";
import { CalendarDays, Clock, CheckCircle, ExternalLink } from "lucide-react";
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
        <p className="text-zinc-400 mb-6">
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayAppts, pendingCount, upcomingAppts] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        businessId: business.id,
        date: today,
        status: { not: "CANCELED" },
      },
      include: { service: { select: { name: true } } },
      orderBy: { startTime: "asc" },
    }),
    prisma.appointment.count({
      where: {
        businessId: business.id,
        status: "PENDING",
        date: { gte: today },
      },
    }),
    prisma.appointment.findMany({
      where: {
        businessId: business.id,
        date: { gte: today },
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
    {
      label: "Agendamentos hoje",
      value: todayAppts.length,
      icon: CalendarDays,
    },
    {
      label: "Pendentes (futuros)",
      value: pendingCount,
      icon: Clock,
    },
    {
      label: "Próximos confirmados",
      value: confirmedCount,
      icon: CheckCircle,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
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
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors"
          style={{
            borderColor: "#f6b914",
            color: "#f6b914",
            backgroundColor: "transparent",
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(246,185,20,0.1)";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
          }}
        >
          <ExternalLink size={14} />
          Painel da Barbearia
        </a>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(246,185,20,0.15)" }}
              >
                <Icon size={22} style={{ color: "#f6b914" }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: "#71717a" }}>
                  {m.label}
                </p>
                <p className="text-3xl font-bold text-white mt-0.5">
                  {m.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agenda de hoje */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Agenda de hoje</h2>
            <div
              className="mt-1 h-0.5 w-8 rounded"
              style={{ backgroundColor: "#f6b914" }}
            />
          </div>
          <Link
            href="/appointments"
            className="text-sm font-medium hover:underline"
            style={{ color: "#f6b914" }}
          >
            Ver todos →
          </Link>
        </div>

        {todayAppts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3 opacity-20">📅</div>
            <p className="font-semibold text-white text-sm">
              Nenhum agendamento para hoje.
            </p>
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
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
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
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h2 className="text-base font-bold text-white mb-4">
            Próximos agendamentos
          </h2>
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
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
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
