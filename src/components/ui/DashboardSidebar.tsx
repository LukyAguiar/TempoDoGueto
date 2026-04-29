"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  CalendarDays, Scissors, Clock, LayoutDashboard,
  Store, LogOut, ExternalLink,
} from "lucide-react";
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

function SidebarContent({ user, onClose }: { user: Props["user"]; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{
        backgroundColor: "#050505",
        borderRight: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Fundo favela */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src="/images/sidebar-bg-crown.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center opacity-50 grayscale"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/40 to-[#050505]" />
        <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-[#050505] via-[#050505]/85 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
      </div>

      {/* Logo */}
      <div className="relative z-20 px-6 pt-8 pb-5">
        <img
          src="/images/logo-tempo-do-gueto.png"
          alt="Tempo do Gueto"
          className="mx-auto h-auto w-[190px] max-w-full object-contain drop-shadow-[0_0_18px_rgba(246,185,20,0.14)]"
        />
        <p className="mt-2 text-center text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: "#52525b" }}>
          Agenda para barbearias da quebrada
        </p>
      </div>

      {/* Divisor */}
      <div className="relative z-20 mx-5 mb-4 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />

      {/* Nav */}
      <nav className="relative z-20 flex-1 overflow-y-auto px-4 pb-4 space-y-1">
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
                "group relative flex items-center gap-3 rounded-[14px] px-4 py-3 text-[13.5px] font-semibold leading-none transition-all duration-150",
                isActive
                  ? "text-[#f6b914]"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.045]"
              )}
              style={
                isActive
                  ? {
                      background: "linear-gradient(90deg, rgba(246,185,20,0.14), rgba(246,185,20,0.04))",
                      border: "1px solid rgba(246,185,20,0.22)",
                      boxShadow: "inset -3px 0 0 #f6b914, 0 4px 24px rgba(246,185,20,0.08)",
                    }
                  : { border: "1px solid transparent" }
              }
            >
              <Icon
                size={17}
                className="shrink-0 transition-transform duration-150 group-hover:scale-110"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: "#f6b914", boxShadow: "0 0 6px #f6b914" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divisor */}
      <div className="relative z-20 mx-5 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />

      {/* Perfil + logout */}
      <div className="relative z-20 px-4 pt-4 pb-5 space-y-2">
        {/* Card perfil */}
        <div
          className="flex items-center gap-3 rounded-[16px] p-3"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {user.image ? (
            <img
              src={user.image}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-yellow-400/30"
            />
          ) : (
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-black"
              style={{ backgroundColor: "#f6b914" }}
            >
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-white leading-tight">{user.name}</p>
            <p className="truncate text-[11px] leading-tight mt-0.5" style={{ color: "#52525b" }}>{user.email}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-[14px] px-4 py-2.5 text-[13px] font-semibold transition-all hover:bg-white/[0.04] active:scale-[0.98]"
          style={{ color: "#52525b", border: "1px solid transparent" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = "#f87171";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.15)";
            (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = "#52525b";
            (e.currentTarget as HTMLElement).style.borderColor = "transparent";
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <LogOut size={15} className="shrink-0" />
          Sair da conta
        </button>
      </div>
    </div>
  );
}

export function DashboardSidebar({ user }: Props) {
  return (
    <SidebarDrawer buttonBg="#161616">
      {(onClose) => <SidebarContent user={user} onClose={onClose} />}
    </SidebarDrawer>
  );
}
