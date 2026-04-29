import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { getBusinessByUserId } from "@/server/repositories/business.repository";
import { prisma } from "@/lib/prisma/client";
import { formatDateDisplay } from "@/lib/dates";
import { APPOINTMENT_STATUS_LABELS } from "@/types";
import { CalendarDays, Clock, CheckCircle, ArrowRight, TrendingUp } from "lucide-react";
import type { AppointmentStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Dashboard" };

const STATUS_BADGE: Record<AppointmentStatus, CSSProperties> = {
  PENDING:   { background: "rgba(251,191,36,0.13)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" },
  CONFIRMED: { background: "rgba(74,222,128,0.11)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.22)" },
  CANCELED:  { background: "rgba(248,113,113,0.10)", color: "#f87171", border: "1px solid rgba(248,113,113,0.20)" },
  COMPLETED: { background: "rgba(129,140,248,0.11)", color: "#818cf8", border: "1px solid rgba(129,140,248,0.22)" },
};

const STATUS_DOT: Record<AppointmentStatus, string> = {
  PENDING: "#fbbf24", CONFIRMED: "#4ade80", CANCELED: "#f87171", COMPLETED: "#818cf8",
};

export default async function DashboardPage() {
  const session = await auth();
  const business = await getBusinessByUserId(session!.user.id);

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="mb-6 text-6xl opacity-30">✂️</div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Olá, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="mb-8 max-w-sm text-sm leading-relaxed" style={{ color: "#71717a" }}>
          Para começar a receber agendamentos, cadastre os dados do seu negócio.
        </p>
        <Link
          href="/business"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-[14px] text-sm font-bold transition-all hover:shadow-[0_0_20px_rgba(246,185,20,0.28)] hover:opacity-92 active:scale-[0.97]"
          style={{ backgroundColor: "#f6b914", color: "#0a0a0a" }}
        >
          Cadastrar negócio <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0));
  const todayEnd   = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59));

  const [todayAppts, pendingCount, upcomingAppts] = await Promise.all([
    prisma.appointment.findMany({
      where: { businessId: business.id, date: { gte: todayStart, lte: todayEnd }, status: { not: "CANCELED" } },
      include: { service: { select: { name: true } } },
      orderBy: { startTime: "asc" },
    }),
    prisma.appointment.count({
      where: { businessId: business.id, status: "PENDING", date: { gte: todayStart } },
    }),
    prisma.appointment.findMany({
      where: { businessId: business.id, date: { gte: todayStart }, status: { notIn: ["CANCELED", "COMPLETED"] } },
      include: { service: { select: { name: true } } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 6,
    }),
  ]);

  const confirmedCount = upcomingAppts.filter((a) => a.status === "CONFIRMED").length;

  const metrics = [
    { label: "Hoje",           value: todayAppts.length, icon: CalendarDays, sub: "agendamentos" },
    { label: "Pendentes",      value: pendingCount,      icon: Clock,         sub: "aguardando confirmação" },
    { label: "Confirmados",    value: confirmedCount,    icon: CheckCircle,   sub: "próximos" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-white leading-tight">
            Olá, {session?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "#52525b" }}>
            Página pública:{" "}
            <a
              href={`/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold transition-colors hover:underline"
              style={{ color: "#f6b914" }}
            >
              /{business.slug}
            </a>
          </p>
        </div>

        <a
          href={`/${business.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-sm font-bold transition-all hover:bg-[rgba(246,185,20,0.1)] active:scale-[0.97]"
          style={{ border: "1px solid rgba(246,185,20,0.35)", color: "#f6b914" }}
        >
          Ver página pública <ArrowRight size={14} />
        </a>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="rounded-[20px] p-5 flex items-center gap-4 transition-all hover:border-white/10"
              style={{ backgroundColor: "#161616", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0"
                style={{ background: "rgba(246,185,20,0.12)", border: "1px solid rgba(246,185,20,0.15)" }}
              >
                <Icon size={19} style={{ color: "#f6b914" }} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#52525b" }}>{m.label}</p>
                <p className="text-[32px] font-black text-white leading-tight mt-0.5">{m.value}</p>
                <p className="text-[11px]" style={{ color: "#3f3f46" }}>{m.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Agenda de hoje */}
        <div className="rounded-[20px] p-6" style={{ backgroundColor: "#161616", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Agenda de hoje</h2>
              <div className="mt-1.5 h-0.5 w-8 rounded-full" style={{ backgroundColor: "#f6b914" }} />
            </div>
            <Link href="/appointments" className="inline-flex items-center gap-1 text-xs font-semibold transition-colors hover:underline" style={{ color: "#f6b914" }}>
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>

          {todayAppts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-3 opacity-15">📅</div>
              <p className="text-sm font-semibold text-white">Nenhum agendamento hoje</p>
              <p className="text-xs mt-1" style={{ color: "#3f3f46" }}>Quando clientes agendarem, aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayAppts.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between py-3 px-4 rounded-[14px] transition-colors"
                  style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: STATUS_DOT[appt.status as AppointmentStatus], boxShadow: `0 0 5px ${STATUS_DOT[appt.status as AppointmentStatus]}` }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {appt.startTime} · {appt.customerName}
                      </p>
                      <p className="text-xs truncate" style={{ color: "#71717a" }}>{appt.service.name}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ml-2"
                    style={STATUS_BADGE[appt.status as AppointmentStatus]}>
                    {APPOINTMENT_STATUS_LABELS[appt.status as AppointmentStatus]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Próximos agendamentos */}
        <div className="rounded-[20px] p-6" style={{ backgroundColor: "#161616", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Próximos agendamentos</h2>
              <div className="mt-1.5 h-0.5 w-8 rounded-full" style={{ backgroundColor: "#f6b914" }} />
            </div>
            <TrendingUp size={15} style={{ color: "#3f3f46" }} />
          </div>

          {upcomingAppts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-3 opacity-15">🗓️</div>
              <p className="text-sm font-semibold text-white">Nenhum próximo agendamento</p>
              <p className="text-xs mt-1" style={{ color: "#3f3f46" }}>Compartilhe seu link para receber agendamentos.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingAppts.map((appt) => {
                const dateStr = new Date(appt.date).toISOString().split("T")[0];
                return (
                  <div
                    key={appt.id}
                    className="flex items-center justify-between py-3 px-4 rounded-[14px] transition-colors"
                    style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: STATUS_DOT[appt.status as AppointmentStatus], boxShadow: `0 0 5px ${STATUS_DOT[appt.status as AppointmentStatus]}` }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{appt.customerName}</p>
                        <p className="text-xs truncate" style={{ color: "#71717a" }}>
                          {appt.service.name} · {formatDateDisplay(dateStr)} às {appt.startTime}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ml-2"
                      style={STATUS_BADGE[appt.status as AppointmentStatus]}>
                      {APPOINTMENT_STATUS_LABELS[appt.status as AppointmentStatus]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
