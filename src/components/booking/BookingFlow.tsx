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
  initialServiceId?: string;
  theme?: string;
  primaryColor?: string;
  cardBg?: string;
  textColor?: string;
  buttonText?: string;
  showPrices?: boolean;
  showDuration?: boolean;
};

type Step = "service" | "datetime" | "details" | "success";

function isColorDark(hex: string): boolean {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  } catch { return true; }
}

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

export function BookingFlow({ slug, services, initialServiceId, theme = "barber", primaryColor = "#f6b914", cardBg = "#161616", textColor = "#ffffff", buttonText = "Confirmar agendamento", showPrices = true, showDuration = true }: Props) {
  const isDark = isColorDark(cardBg);
  const btnText = isColorDark(primaryColor) ? "#ffffff" : "#000000";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const [selectedService, setSelectedService] = useState<Service | null>(
    initialServiceId ? (services.find((s) => s.id === initialServiceId) ?? null) : null
  );
  const [step, setStep] = useState<Step>(initialServiceId ? "datetime" : "service");
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
      <div className="rounded-[20px] p-6" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: textColor }}>Escolha um serviço</h2>
        {services.length === 0 ? (
          <p className="text-sm" style={{ color: textMuted }}>Nenhum serviço disponível no momento.</p>
        ) : (
          <div className="space-y-2">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => {
                  setSelectedService(service);
                  setStep("datetime");
                }}
                className="w-full flex items-center justify-between p-4 rounded-[14px] transition-all duration-150 text-left"
                style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px solid ${borderColor}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${primaryColor}55`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = borderColor; }}
              >
                <div>
                  <p className="font-bold text-sm" style={{ color: textColor }}>{service.name}</p>
                  {showDuration && <p className="text-xs" style={{ color: textMuted }}>{service.durationMinutes} min</p>}
                </div>
                {showPrices && service.price != null && (
                  <span className="text-sm font-black" style={{ color: primaryColor }}>
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
          className="flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: textMuted }}
        >
          <ChevronLeft size={16} /> Voltar
        </button>

        {/* Data */}
        <div className="rounded-[20px] p-6" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: textColor }}>Escolha uma data</h2>
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
                  className="flex flex-col items-center p-2 rounded-[12px] text-sm transition-all duration-150"
                  style={isSelected
                    ? { backgroundColor: primaryColor, color: isColorDark(primaryColor) ? "#fff" : "#000", border: `1px solid ${primaryColor}` }
                    : { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${borderColor}`, color: textColor }
                  }
                >
                  <span className="text-[11px] opacity-60 capitalize">{weekDay}</span>
                  <span className="font-black text-base">{dayNum}</span>
                  <span className="text-[11px] opacity-60 capitalize">{month}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Horários */}
        {selectedDate && (
          <div className="rounded-[20px] p-6" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: textColor }}>
              Horários disponíveis em{" "}
              <span className="text-brand-700">
                {formatDateDisplay(selectedDate)}
              </span>
            </h2>

            {loadingSlots && (
              <div className="flex items-center gap-2 text-sm" style={{ color: textMuted }}>
                <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: primaryColor, borderTopColor: "transparent" }} />
                Carregando horários...
              </div>
            )}

            {!loadingSlots && noSlotsMsg && (
              <p className="text-sm" style={{ color: textMuted }}>{noSlotsMsg}</p>
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
                    className="py-2 px-3 rounded-[10px] text-sm font-bold transition-all duration-150"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${borderColor}`, color: textColor }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = primaryColor; (e.currentTarget as HTMLElement).style.color = isColorDark(primaryColor) ? "#fff" : "#000"; (e.currentTarget as HTMLElement).style.borderColor = primaryColor; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"; (e.currentTarget as HTMLElement).style.color = textColor; (e.currentTarget as HTMLElement).style.borderColor = borderColor; }}
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
          className="flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: textMuted }}
        >
          <ChevronLeft size={16} /> Voltar
        </button>

        {/* Resumo do que foi escolhido */}
        <div className="rounded-[16px] p-4 text-sm" style={{ backgroundColor: `${primaryColor}12`, border: `1px solid ${primaryColor}30` }}>
          <p className="font-black" style={{ color: primaryColor }}>{selectedService!.name}</p>
          <p className="mt-0.5 font-medium" style={{ color: textColor }}>
            {formatDateDisplay(selectedDate!)} às {selectedTime}
            {" · "}{selectedService!.durationMinutes} min
          </p>
        </div>

        <div className="rounded-[20px] p-6" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: textColor }}>Seus dados</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
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
              {isSubmitting ? "Confirmando..." : buttonText}
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
