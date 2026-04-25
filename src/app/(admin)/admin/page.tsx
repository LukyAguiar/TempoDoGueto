import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma/client";
import { Users, Store, CalendarDays, UserX } from "lucide-react";

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
      color: "#f6b914",
    },
    {
      label: "Barbearias",
      value: totalBusinesses,
      sub: `${activeBusinesses} ativas`,
      icon: Store,
      href: "/admin/businesses",
      color: "#a78bfa",
    },
    {
      label: "Total de agendamentos",
      value: totalAppointments,
      sub: "na plataforma",
      icon: CalendarDays,
      href: "/admin/businesses",
      color: "#34d399",
    },
    {
      label: "Usuários inativos",
      value: totalUsers - activeUsers,
      sub: "bloqueados",
      icon: UserX,
      href: "/admin/users",
      color: "#f87171",
    },
  ];

  const cardStyle = {
    backgroundColor: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.06)",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Visão Geral</h1>
      <p className="mb-8 text-sm" style={{ color: "#71717a" }}>
        Painel de controle da plataforma.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.label}
              href={m.href}
              className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:scale-[1.02]"
              style={cardStyle}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${m.color}18` }}
              >
                <Icon size={22} style={{ color: m.color }} />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{m.value}</p>
                <p className="text-sm font-medium text-white mt-0.5">{m.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "#52525b" }}>{m.sub}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
