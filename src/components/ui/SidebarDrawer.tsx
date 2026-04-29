"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  children: (onClose: () => void) => React.ReactNode;
  buttonBg?: string;
};

export function SidebarDrawer({ children, buttonBg = "#1e1e1e" }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function close() { setOpen(false); }

  return (
    <>
      {/* Botão hamburger mobile — fixed para sempre visível */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="md:hidden fixed top-3.5 left-3.5 z-30 p-2.5 rounded-xl text-white transition-all active:scale-95"
        style={{
          backgroundColor: buttonBg,
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        }}
      >
        <Menu size={19} />
      </button>

      {/* Overlay */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer mobile */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-out md:hidden",
          "w-[84vw] min-w-[300px] max-w-[340px] shadow-2xl shadow-black/60",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={close}
          aria-label="Fechar menu"
          className="absolute top-4 right-3.5 z-10 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X size={17} />
        </button>
        {children(close)}
      </div>

      {/* Sidebar desktop — sticky height 100vh, no scroll próprio */}
      <aside
        className="hidden md:flex flex-col shrink-0"
        style={{ width: "280px", height: "100vh", position: "sticky", top: 0 }}
      >
        {children(() => {})}
      </aside>
    </>
  );
}
