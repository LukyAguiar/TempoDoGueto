"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { NewAppointmentModal } from "@/components/business/NewAppointmentModal";
import type { Service } from "@prisma/client";

type Props = {
  slug: string;
  services: Service[];
};

export function AppointmentsHeader({ slug, services }: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-transform active:scale-[0.98] sm:py-2.5"
        style={{ backgroundColor: "#f6b914", color: "#0a0a0a" }}
      >
        <Plus size={15} />
        Novo agendamento
      </button>

      {showModal && (
        <NewAppointmentModal
          slug={slug}
          services={services}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
