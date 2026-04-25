"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { CalendarDays, Scissors, Clock, LayoutDashboard, Store, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarDrawer } from "@/components/ui/SidebarDrawer";

const navItems = [
  { href: "/dashboard",    label: "Visão Geral",     icon: LayoutDashboard },
  { href: "/appointments", label: "Agendamentos",    icon: CalendarDays },
  { href: "/services",     label: "Serviços",        icon: Scissors },
  { href: "/availability", label: "Disponibilidade", icon: Clock },
  { href: "/business",     label: "Meu Negócio",     icon: Store },
];

type Props = { user: { name?: string | null; email?: string | null } };

function BarberSidebarContent({ user, onClose }: { user: Props["user"]; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#111111" }}>
      {/* Logo */}
      <div className="px-5 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-tempo-do-gueto.png"
          alt="Tempo do Gueto"
          className="h-10 w-auto"
          style={{ mixBlendMode: "screen" }}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-5 py-6 space-y-2 overflow-y-auto">
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
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "text-black font-semibold"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
              style={isActive ? { backgroundColor: "#f6b914" } : undefined}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Imagem decorativa */}
      <div className="mx-5 mb-4 rounded-xl overflow-hidden" style={{ height: "120px", opacity: 0.25 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/favela-night.png" alt="" className="w-full h-full object-cover" />
      </div>

      {/* User + logout */}
      <div className="px-5 py-5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-black font-bold text-sm shrink-0"
            style={{ backgroundColor: "#f6b914" }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs truncate" style={{ color: "#52525b" }}>{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm w-full transition-all text-zinc-500 hover:text-white hover:bg-white/5"
        >
          <LogOut size={16} />
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
