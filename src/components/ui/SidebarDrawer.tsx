"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  children: (onClose: () => void) => React.ReactNode;
  buttonBg?: string;
};

export function SidebarDrawer({ children, buttonBg = "#363636" }: Props) {
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
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="md:hidden fixed top-4 left-4 z-30 p-3 rounded-2xl text-white shadow-lg shadow-black/30 transition-transform active:scale-95"
        style={{
          backgroundColor: buttonBg,
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Menu size={20} />
      </button>

      <div
        className={cn(
          "md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={close}
        aria-hidden="true"
      />

      <div
        className={cn(
          "fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-out md:hidden",
          "w-[85vw] max-w-sm shadow-2xl shadow-black/50",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={close}
          aria-label="Fechar menu"
          className="absolute top-4 right-4 z-10 p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X size={18} />
        </button>

        {children(close)}
      </div>

      <aside className="hidden md:flex flex-col w-64 min-h-screen shrink-0 sticky top-0">
        {children(() => {})}
      </aside>
    </>
  );
}
