"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Service } from "@prisma/client";
import { appointmentSchema, type AppointmentInput } from "@/schemas/appointment";
import { bookAppointment, type BookingConfirmation } from "@/server/actions/appointment";
import { formatDateDisplay } from "@/lib/dates";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BookingSuccess } from "@/components/booking/BookingSuccess";
import { ChevronLeft } from "lucide-react";

type Props = {
  slug: string;
  services: Service[];
};

type Step = "service" | "datetime" | "details" | "success";

function getNextDays(count: number): string[] {
  const days: string[] = [];
  let current = new Date();

  while (days.length < count) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, "0");
    const dd = String(current.getDate()).padStart(2, "0");
    days.push(`${yyyy}-${mm}-${dd}`);
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export function BookingFlow({ slug, services }: Props) {
  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [noSlotsMsg, setNoSlotsMsg] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
  });

  function resetFlow() {
    setStep("service");
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setAvailableSlots([]);
    setConfirmation(null);
    setServerError(null);
  }

  // ── Step 1: Seleção de serviço ──────────────────────────────
  if (step === "service") {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Escolha um serviço
        </h2>
        {services.length === 0 ? (
          <p className="text-slate-400 text-sm">
            Nenhum serviço disponível no momento.
          </p>
        ) : (
          <div className="space-y-2">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => {
                  setSelectedService(service);
                  setStep("datetime");
                }}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-brand-400 hover:bg-brand-50 transition-colors text-left"
              >
                <div>
                  <p className="font-medium text-slate-900">{service.name}</p>
                  <p className="text-sm text-slate-500">
                    {service.durationMinutes} min
                  </p>
                </div>
                {service.price != null && (
                  <span className="text-brand-700 font-semibold text-sm">
                    {formatCurrency(Number(service.price))}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Step 2: Seleção de data e horário ───────────────────────
  if (step === "datetime") {
    const days = getNextDays(30);

    async function handleDateSelect(date: string) {
      setSelectedDate(date);
      setSelectedTime(null);
      setAvailableSlots([]);
      setNoSlotsMsg(null);
      setLoadingSlots(true);

      try {
        const res = await fetch(
          `/api/slots?slug=${slug}&serviceId=${selectedService!.id}&date=${date}`
        );
        const data = await res.json();

        if (data.slots?.length === 0) {
          setNoSlotsMsg("Nenhum horário disponível neste dia.");
        }
        setAvailableSlots(data.slots ?? []);
      } catch {
        setNoSlotsMsg("Erro ao carregar horários.");
      } finally {
        setLoadingSlots(false);
      }
    }

    return (
      <div className="space-y-4">
        <button
          onClick={() => setStep("service")}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ChevronLeft size={16} /> Voltar
        </button>

        {/* Data */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Escolha uma data
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {days.map((day) => {
              const d = new Date(day + "T12:00:00");
              const dayNum = d.getDate();
              const weekDay = d.toLocaleDateString("pt-BR", { weekday: "short" });
              const month = d.toLocaleDateString("pt-BR", { month: "short" });
              const isSelected = selectedDate === day;

              return (
                <button
                  key={day}
                  onClick={() => handleDateSelect(day)}
                  className={`flex flex-col items-center p-2 rounded-lg border text-sm transition-colors ${
                    isSelected
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-slate-200 hover:border-brand-300 hover:bg-brand-50"
                  }`}
                >
                  <span className="text-xs opacity-70 capitalize">{weekDay}</span>
                  <span className="font-bold text-base">{dayNum}</span>
                  <span className="text-xs opacity-70 capitalize">{month}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Horários */}
        {selectedDate && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Horários disponíveis em{" "}
              <span className="text-brand-700">
                {formatDateDisplay(selectedDate)}
              </span>
            </h2>

            {loadingSlots && (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                Carregando horários...
              </div>
            )}

            {!loadingSlots && noSlotsMsg && (
              <p className="text-slate-400 text-sm">{noSlotsMsg}</p>
            )}

            {!loadingSlots && availableSlots.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => {
                      setSelectedTime(slot);
                      setStep("details");
                    }}
                    className="py-2 px-3 rounded-lg border border-slate-200 text-sm font-medium hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Step 3: Dados do cliente ────────────────────────────────
  if (step === "details") {
    async function onSubmit(data: AppointmentInput) {
      setServerError(null);

      const result = await bookAppointment(slug, {
        ...data,
        serviceId: selectedService!.id,
        date: selectedDate!,
        startTime: selectedTime!,
      });

      if (!result.success) {
        setServerError(result.error);
        return;
      }

      setConfirmation(result.confirmation);
      setStep("success");
    }

    return (
      <div className="space-y-4">
        <button
          onClick={() => setStep("datetime")}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ChevronLeft size={16} /> Voltar
        </button>

        {/* Resumo do que foi escolhido */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-sm">
          <p className="font-semibold text-brand-900">{selectedService!.name}</p>
          <p className="text-brand-700 mt-0.5">
            {formatDateDisplay(selectedDate!)} às {selectedTime}
            {" · "}{selectedService!.durationMinutes} min
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Seus dados
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {serverError}
              </div>
            )}

            {/* Campos ocultos */}
            <input type="hidden" {...register("serviceId")} value={selectedService!.id} />
            <input type="hidden" {...register("date")} value={selectedDate!} />
            <input type="hidden" {...register("startTime")} value={selectedTime!} />

            <Input
              label="Seu nome"
              placeholder="João Silva"
              error={errors.customerName?.message}
              {...register("customerName")}
            />
            <Input
              label="Telefone / WhatsApp"
              placeholder="(11) 99999-9999"
              error={errors.customerPhone?.message}
              {...register("customerPhone")}
            />
            <Input
              label="Observações (opcional)"
              placeholder="Ex: preferência de profissional..."
              {...register("notes")}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isSubmitting}
            >
              {isSubmitting ? "Confirmando agendamento..." : "Confirmar agendamento"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // ── Step 4: Confirmação completa ────────────────────────────
  return (
    <BookingSuccess
      confirmation={confirmation!}
      onNewBooking={resetFlow}
    />
  );
}
