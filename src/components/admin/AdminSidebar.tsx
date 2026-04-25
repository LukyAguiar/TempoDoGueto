"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Users, Store, LayoutDashboard, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarDrawer } from "@/components/ui/SidebarDrawer";

const navItems = [
  { href: "/admin",            label: "Visão Geral", icon: LayoutDashboard, exact: true },
  { href: "/admin/users",      label: "Usuários",    icon: Users,           exact: false },
  { href: "/admin/businesses", label: "Barbearias",  icon: Store,           exact: false },
];

type Props = { user: { name?: string | null; email?: string | null } };

function AdminSidebarContent({ user, onClose }: { user: Props["user"]; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#0f172a" }}>
      {/* Header */}
      <div className="px-5 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(246,185,20,0.15)" }}
          >
            <Shield size={16} style={{ color: "#f6b914" }} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Admin</p>
            <p className="text-xs" style={{ color: "#475569" }}>Tempo do Gueto</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-5 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
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
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
              style={isActive ? { backgroundColor: "#f6b914" } : undefined}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

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
            <p className="text-xs truncate" style={{ color: "#475569" }}>{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm w-full transition-all text-slate-500 hover:text-white hover:bg-white/5"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar({ user }: Props) {
  return (
    <SidebarDrawer buttonBg="#1e293b">
      {(onClose) => <AdminSidebarContent user={user} onClose={onClose} />}
    </SidebarDrawer>
  );
}
