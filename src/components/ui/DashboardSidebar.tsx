"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  CalendarDays,
  Scissors,
  Clock,
  LayoutDashboard,
  Store,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",     label: "Visão Geral",    icon: LayoutDashboard },
  { href: "/appointments",  label: "Agendamentos",   icon: CalendarDays },
  { href: "/services",      label: "Serviços",       icon: Scissors },
  { href: "/availability",  label: "Disponibilidade",icon: Clock },
  { href: "/business",      label: "Meu Negócio",    icon: Store },
];

type Props = {
  user: { name?: string | null; email?: string | null };
};

function SidebarContent({
  user,
  onClose,
}: {
  user: Props["user"];
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "#111111" }}
    >
      {/* Logo */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-tempo-do-gueto.png"
          alt="Tempo do Gueto"
          className="h-10 w-auto"
        />
        {/* Botão fechar — só no mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-zinc-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "text-black font-semibold"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
              style={
                isActive
                  ? { backgroundColor: "#f6b914" }
                  : undefined
              }
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Imagem de fundo decorativa */}
      <div
        className="mx-3 mb-3 rounded-xl overflow-hidden opacity-30"
        style={{ height: "140px" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/favela-night.png"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* User + logout */}
      <div
        className="px-3 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-3 px-2 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-black font-bold text-sm shrink-0"
            style={{ backgroundColor: "#f6b914" }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-500 hover:text-white hover:bg-white/5 w-full transition-all"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  );
}

export function DashboardSidebar({ user }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Botão hamburger — só no mobile ─────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-xl text-white"
        style={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <Menu size={20} />
      </button>

      {/* ── Overlay mobile ─────────────────────────────────── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Drawer mobile ──────────────────────────────────── */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full z-50 w-72 transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent user={user} onClose={() => setOpen(false)} />
      </div>

      {/* ── Sidebar desktop ────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen shrink-0">
        <SidebarContent user={user} />
      </aside>
    </>
  );
}
