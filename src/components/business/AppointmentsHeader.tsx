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
        className="btn-gold inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm"
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
