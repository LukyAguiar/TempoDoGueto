"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  children: (onClose: () => void) => React.ReactNode;
  /** Cor do botão hamburger. Default: #363636 */
  buttonBg?: string;
};

/**
 * SidebarDrawer — wrapper responsivo reutilizável.
 * - Desktop: renderiza sidebar estática (md:static)
 * - Mobile: esconde sidebar, mostra botão hamburger, abre drawer com overlay
 *
 * Uso:
 * <SidebarDrawer>
 *   {(onClose) => <MeuConteudoDoSidebar onClose={onClose} />}
 * </SidebarDrawer>
 */
export function SidebarDrawer({ children, buttonBg = "#363636" }: Props) {
  const [open, setOpen] = useState(false);

  // Fecha com ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Trava scroll do body quando drawer está aberto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function close() { setOpen(false); }

  return (
    <>
      {/* ── Botão hamburger — só no mobile ─────────────────── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="md:hidden fixed top-4 left-4 z-30 p-2.5 rounded-xl text-white transition-colors"
        style={{
          backgroundColor: buttonBg,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Menu size={20} />
      </button>

      {/* ── Overlay backdrop — mobile ───────────────────────── */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* ── Drawer mobile ──────────────────────────────────── */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out md:hidden",
          "w-[280px] max-w-[85vw]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Botão fechar dentro do drawer */}
        <button
          onClick={close}
          aria-label="Fechar menu"
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-white/50 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {children(close)}
      </div>

      {/* ── Sidebar desktop — estática ─────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen shrink-0">
        {children(() => {})}
      </aside>
    </>
  );
}
