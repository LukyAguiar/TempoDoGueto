import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAppointmentById } from "@/server/repositories/appointment.repository";
import { AppointmentStatusCard } from "@/components/booking/AppointmentStatusCard";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const appointment = await getAppointmentById(params.id);
  if (!appointment) return { title: "Agendamento não encontrado" };
  return { title: `Agendamento — ${appointment.business.name}` };
}

export default async function BookingStatusPage({ params }: Props) {
  const appointment = await getAppointmentById(params.id);

  if (!appointment) notFound();

  const data = {
    id: appointment.id,
    status: appointment.status,
    customerName: appointment.customerName,
    customerPhone: appointment.customerPhone,
    serviceName: appointment.service.name,
    date: appointment.date.toISOString().split("T")[0],
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    notes: appointment.notes,
    businessName: appointment.business.name,
    businessPhone: appointment.business.phone ?? null,
    businessSlug: appointment.business.slug,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <p className="text-sm text-slate-400">{appointment.business.name}</p>
        </div>
        <AppointmentStatusCard appointment={data} />
      </div>
    </div>
  );
}
