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
    <div className="space-y-2">
      {rows.map((row) => (
        <div
          key={row.weekDay}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
          style={{
            backgroundColor: row.enabled
              ? "rgba(246,185,20,0.06)"
              : "rgba(255,255,255,0.03)",
            border: row.enabled
              ? "1px solid rgba(246,185,20,0.2)"
              : "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Toggle */}
          <div
            onClick={() => !row.saving && handleToggle(row.weekDay, !row.enabled)}
            className="relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0"
            style={{
              backgroundColor: row.enabled ? "#f6b914" : "#3f3f46",
              opacity: row.saving ? 0.5 : 1,
            }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
              style={{ transform: row.enabled ? "translateX(20px)" : "translateX(0)" }}
            />
          </div>

          {/* Label do dia */}
          <span
            className="text-sm font-medium w-36 shrink-0"
            style={{ color: row.enabled ? "#f4f4f5" : "#52525b" }}
          >
            {WEEK_DAY_LABELS[row.weekDay]}
          </span>

          {/* Horários */}
          {row.enabled ? (
            row.editing ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={row.startTime}
                  onChange={(e) => updateRow(row.weekDay, { startTime: e.target.value })}
                  className="px-2 py-1 rounded-lg text-sm text-white outline-none"
                  style={{ backgroundColor: "#1e1e1e", border: "1px solid #3f3f46", width: "110px" }}
                />
                <span className="text-xs" style={{ color: "#52525b" }}>até</span>
                <input
                  type="time"
                  value={row.endTime}
                  onChange={(e) => updateRow(row.weekDay, { endTime: e.target.value })}
                  className="px-2 py-1 rounded-lg text-sm text-white outline-none"
                  style={{ backgroundColor: "#1e1e1e", border: "1px solid #3f3f46", width: "110px" }}
                />
                <button
                  onClick={() => handleSave(row.weekDay)}
                  disabled={row.saving}
                  className="px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-50"
                  style={{ backgroundColor: "#f6b914", color: "#0a0a0a" }}
                >
                  {row.saving ? "..." : "Salvar"}
                </button>
                <button
                  onClick={() => updateRow(row.weekDay, { editing: false })}
                  className="px-3 py-1 rounded-lg text-xs font-medium"
                  style={{ color: "#71717a" }}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm" style={{ color: "#a1a1aa" }}>
                  {row.startTime}
                </span>
                <span className="text-xs" style={{ color: "#52525b" }}>até</span>
                <span className="text-sm" style={{ color: "#a1a1aa" }}>
                  {row.endTime}
                </span>
                <button
                  onClick={() => updateRow(row.weekDay, { editing: true })}
                  className="ml-2 p-1 rounded-lg transition-colors"
                  style={{ color: "#52525b" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f6b914")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#52525b")}
                >
                  <Pencil size={13} />
                </button>
              </div>
            )
          ) : (
            <span className="text-sm" style={{ color: "#3f3f46" }}>Fechado</span>
          )}

          {row.error && (
            <p className="text-xs" style={{ color: "#ef4444" }}>{row.error}</p>
          )}
        </div>
      ))}
    </div>
  );
}
