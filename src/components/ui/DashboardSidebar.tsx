"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { CalendarDays, Scissors, Clock, LayoutDashboard, Store, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarDrawer } from "@/components/ui/SidebarDrawer";

const navItems = [
  { href: "/dashboard",    label: "Visão Geral",     icon: LayoutDashboard },
  { href: "/appointments", label: "Agendamentos",    icon: CalendarDays },
  { href: "/services",     label: "Serviços",        icon: Scissors },
  { href: "/availability", label: "Disponibilidade", icon: Clock },
  { href: "/business",     label: "Meu Negócio",     icon: Store },
];

type Props = { user: { name?: string | null; email?: string | null; image?: string | null } };

function BarberSidebarContent({ user, onClose }: { user: Props["user"]; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #090909 0%, #0d0d0d 45%, #090909 100%)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-[150px] top-[405px] overflow-hidden">
        <div className="absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-[#0b0b0b] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-[#090909] to-transparent" />
        <div className="absolute inset-0 z-10 bg-black/45" />
        <img src="/images/favela-night.png" alt="" className="h-full w-full object-cover opacity-45 grayscale" />
      </div>

      <div className="relative z-20 px-6 pb-7 pt-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-tempo-do-gueto.png"
          alt="Tempo do Gueto"
          className="mx-auto h-auto w-[190px] max-w-full object-contain mix-blend-screen"
        />
        <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-zinc-300">
          Agenda para barbearias da quebrada
        </p>
      </div>

      <nav className="relative z-20 flex-1 space-y-4 overflow-y-auto px-6 py-9">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "relative flex items-center gap-4 rounded-2xl px-4 py-4 text-[17px] font-semibold transition-all active:scale-[0.98]",
                isActive
                  ? "text-yellow-400 shadow-[0_0_24px_rgba(246,185,20,0.08)]"
                  : "text-zinc-300 hover:bg-white/[0.04] hover:text-white"
              )}
              style={
                isActive
                  ? {
                      background: "linear-gradient(90deg, rgba(246,185,20,0.10), rgba(246,185,20,0.02))",
                      border: "1px solid rgba(246,185,20,0.55)",
                      boxShadow: "inset -3px 0 0 #f6b914, 0 10px 30px rgba(246,185,20,0.08)",
                    }
                  : undefined
              }
            >
              <Icon size={24} strokeWidth={isActive ? 2.4 : 2.1} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="relative z-20 px-6 pb-7 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="mb-4 flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/20">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white/15" />
          ) : (
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-black ring-2 ring-white/15"
              style={{ backgroundColor: "#f6b914" }}
            >
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-bold text-white">{user.name}</p>
            <p className="truncate text-sm text-zinc-400">{user.email}</p>
          </div>
          <ChevronDown size={18} className="shrink-0 text-zinc-300" />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-[17px] font-semibold text-zinc-400 transition-all hover:bg-white/5 hover:text-white active:scale-[0.98]"
        >
          <LogOut size={23} />
          Sair
        </button>
      </div>
    </div>
  );
}

export function DashboardSidebar({ user }: Props) {
  return (
    <SidebarDrawer buttonBg="#363636">
      {(onClose) => <BarberSidebarContent user={user} onClose={onClose} />}
    </SidebarDrawer>
  );
}
