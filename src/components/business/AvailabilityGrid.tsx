"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Availability } from "@prisma/client";
import { saveAvailability, removeAvailability } from "@/server/actions/availability";
import { Pencil } from "lucide-react";
import { WEEK_DAY_LABELS, type WeekDay } from "@/types";

const ALL_DAYS: WeekDay[] = [0, 1, 2, 3, 4, 5, 6];

type DayRow = {
  weekDay: WeekDay;
  startTime: string;
  endTime: string;
  enabled: boolean;
  saving: boolean;
  editing: boolean;
  error: string | null;
};

type Props = { availability: Availability[] };

export function AvailabilityGrid({ availability }: Props) {
  const router = useRouter();

  const [rows, setRows] = useState<DayRow[]>(() =>
    ALL_DAYS.map((day) => {
      const existing = availability.find((a) => a.weekDay === day);
      return {
        weekDay: day,
        startTime: existing?.startTime ?? "09:00",
        endTime: existing?.endTime ?? "18:00",
        enabled: !!existing,
        saving: false,
        editing: false,
        error: null,
      };
    })
  );

  function updateRow(weekDay: WeekDay, patch: Partial<DayRow>) {
    setRows((prev) => prev.map((r) => (r.weekDay === weekDay ? { ...r, ...patch } : r)));
  }

  async function handleToggle(day: WeekDay, enabled: boolean) {
    updateRow(day, { saving: true, error: null });

    if (!enabled) {
      const result = await removeAvailability(day);
      updateRow(day, { enabled: false, saving: false, editing: false, error: result.success ? null : result.error });
      if (result.success) router.refresh();
      return;
    }

    const row = rows.find((r) => r.weekDay === day)!;
    const result = await saveAvailability({ weekDay: day, startTime: row.startTime, endTime: row.endTime });
    updateRow(day, { enabled: result.success, saving: false, error: result.success ? null : result.error });
    if (result.success) router.refresh();
  }

  async function handleSave(day: WeekDay) {
    const row = rows.find((r) => r.weekDay === day)!;
    updateRow(day, { saving: true, error: null });
    const result = await saveAvailability({ weekDay: day, startTime: row.startTime, endTime: row.endTime });
    updateRow(day, { saving: false, editing: false, error: result.success ? null : result.error });
    if (result.success) router.refresh();
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div
          key={row.weekDay}
          className="rounded-2xl px-4 py-4 transition-colors"
          style={{
            backgroundColor: row.enabled ? "rgba(246,185,20,0.06)" : "rgba(255,255,255,0.03)",
            border: row.enabled ? "1px solid rgba(246,185,20,0.2)" : "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => !row.saving && handleToggle(row.weekDay, !row.enabled)}
              className="relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed"
              style={{ backgroundColor: row.enabled ? "#f6b914" : "#3f3f46", opacity: row.saving ? 0.5 : 1 }}
              disabled={row.saving}
              aria-pressed={row.enabled}
            >
              <span
                className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform"
                style={{ transform: row.enabled ? "translateX(20px)" : "translateX(0)" }}
              />
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold" style={{ color: row.enabled ? "#f4f4f5" : "#71717a" }}>
                {WEEK_DAY_LABELS[row.weekDay]}
              </p>
              {!row.editing && (
                <p className="mt-0.5 text-xs" style={{ color: row.enabled ? "#a1a1aa" : "#52525b" }}>
                  {row.enabled ? `${row.startTime} até ${row.endTime}` : "Fechado"}
                </p>
              )}
            </div>

            {row.enabled && !row.editing && (
              <button
                onClick={() => updateRow(row.weekDay, { editing: true })}
                className="rounded-xl p-2 transition-colors hover:bg-white/5"
                style={{ color: "#71717a" }}
              >
                <Pencil size={15} />
              </button>
            )}
          </div>

          {row.enabled && row.editing && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:items-center">
              <input
                type="time"
                value={row.startTime}
                onChange={(e) => updateRow(row.weekDay, { startTime: e.target.value })}
                className="rounded-xl px-3 py-2 text-sm text-white outline-none"
                style={{ backgroundColor: "#1e1e1e", border: "1px solid #3f3f46" }}
              />
              <input
                type="time"
                value={row.endTime}
                onChange={(e) => updateRow(row.weekDay, { endTime: e.target.value })}
                className="rounded-xl px-3 py-2 text-sm text-white outline-none"
                style={{ backgroundColor: "#1e1e1e", border: "1px solid #3f3f46" }}
              />
              <button
                onClick={() => handleSave(row.weekDay)}
                disabled={row.saving}
                className="rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-50"
                style={{ backgroundColor: "#f6b914", color: "#0a0a0a" }}
              >
                {row.saving ? "Salvando..." : "Salvar"}
              </button>
              <button
                onClick={() => updateRow(row.weekDay, { editing: false })}
                className="rounded-xl px-3 py-2 text-xs font-medium hover:bg-white/5"
                style={{ color: "#a1a1aa" }}
              >
                Cancelar
              </button>
            </div>
          )}

          {row.error && <p className="mt-3 text-xs" style={{ color: "#ef4444" }}>{row.error}</p>}
        </div>
      ))}
    </div>
  );
}
