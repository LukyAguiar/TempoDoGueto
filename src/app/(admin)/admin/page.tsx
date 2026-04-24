import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma/client";
import { Users, Store, CalendarDays, UserCheck } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Visão Geral" };

export default async function AdminPage() {
  const [totalUsers, activeUsers, totalBusinesses, activeBusinesses, totalAppointments] =
    await Promise.all([
      prisma.user.count({ where: { role: "BARBER" } }),
      prisma.user.count({ where: { role: "BARBER", isActive: true } }),
      prisma.business.count(),
      prisma.business.count({ where: { isActive: true } }),
      prisma.appointment.count(),
    ]);

  const metrics = [
    {
      label: "Barbeiros cadastrados",
      value: totalUsers,
      sub: `${activeUsers} ativos`,
      icon: Users,
      href: "/admin/users",
      color: "text-brand-600",
      bg: "bg-brand-50",
    },
    {
      label: "Barbearias",
      value: totalBusinesses,
      sub: `${activeBusinesses} ativas`,
      icon: Store,
      href: "/admin/businesses",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Total de agendamentos",
      value: totalAppointments,
      sub: "na plataforma",
      icon: CalendarDays,
      href: "/admin/businesses",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Usuários inativos",
      value: totalUsers - activeUsers,
      sub: "bloqueados",
      icon: UserCheck,
      href: "/admin/users",
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Visão Geral</h1>
      <p className="text-slate-500 mb-8">Painel de controle da plataforma.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.label}
              href={m.href}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-brand-300 hover:shadow-sm transition-all"
            >
              <div className={`w-10 h-10 ${m.bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon size={20} className={m.color} />
              </div>
              <p className="text-3xl font-bold text-slate-900">{m.value}</p>
              <p className="text-sm font-medium text-slate-700 mt-0.5">{m.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{m.sub}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
