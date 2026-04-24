import { format, parse, addMinutes, isBefore, isAfter, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Converte "HH:mm" para minutos desde meia-noite
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Converte minutos desde meia-noite para "HH:mm"
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Adiciona minutos a um horário "HH:mm", retorna "HH:mm"
 */
export function addMinutesToTime(time: string, minutes: number): string {
  return minutesToTime(timeToMinutes(time) + minutes);
}

/**
 * Verifica se dois intervalos de horário se sobrepõem
 * Intervalos: [start1, end1) e [start2, end2) — fim é exclusivo
 */
export function hasTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && e1 > s2;
}

/**
 * Gera todos os slots possíveis dentro de um intervalo
 * dado um step (duração do serviço em minutos)
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number
): string[] {
  const slots: string[] = [];
  let current = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  while (current + durationMinutes <= end) {
    slots.push(minutesToTime(current));
    current += durationMinutes;
  }

  return slots;
}

/**
 * Formata uma data Date para "yyyy-MM-dd" (formato usado nos campos do banco)
 */
export function formatDateToISO(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Formata data para exibição em pt-BR
 */
export function formatDateDisplay(dateStr: string): string {
  const date = parse(dateStr, "yyyy-MM-dd", new Date());
  return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

/**
 * Verifica se uma data/horário já passou
 */
export function isSlotInPast(dateStr: string, timeStr: string): boolean {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  const slotDate = new Date(year, month - 1, day, hours, minutes);
  return isBefore(slotDate, new Date());
}
