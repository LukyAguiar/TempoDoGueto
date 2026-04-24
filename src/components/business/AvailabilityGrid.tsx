"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Availability } from "@prisma/client";
import { saveAvailability, removeAvailability } from "@/server/actions/availability";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { WEEK_DAY_LABELS, type WeekDay } from "@/types";

const ALL_DAYS: WeekDay[] = [0, 1, 2, 3, 4, 5, 6];

type DayRow = {
  weekDay: WeekDay;
  startTime: string;
  endTime: string;
  enabled: boolean;
  saving: boolean;
  error: string | null;
};

type Props = {
  availability: Availability[];
};

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
        error: null,
      };
    })
  );

  function updateRow(weekDay: WeekDay, patch: Partial<DayRow>) {
    setRows((prev) =>
      prev.map((r) => (r.weekDay === weekDay ? { ...r, ...patch } : r))
    );
  }

  async function handleToggle(day: WeekDay, enabled: boolean) {
    updateRow(day, { saving: true, error: null });

    if (!enabled) {
      const result = await removeAvailability(day);
      updateRow(day, {
        enabled: false,
        saving: false,
        error: result.success ? null : result.error,
      });
      if (result.success) router.refresh();
      return;
    }

    const row = rows.find((r) => r.weekDay === day)!;
    const result = await saveAvailability({
      weekDay: day,
      startTime: row.startTime,
      endTime: row.endTime,
    });

    updateRow(day, {
      enabled: result.success,
      saving: false,
      error: result.success ? null : result.error,
    });
    if (result.success) router.refresh();
  }

  async function handleSave(day: WeekDay) {
    const row = rows.find((r) => r.weekDay === day)!;
    updateRow(day, { saving: true, error: null });

    const result = await saveAvailability({
      weekDay: day,
      startTime: row.startTime,
      endTime: row.endTime,
    });

    updateRow(day, {
      saving: false,
      error: result.success ? null : result.error,
    });
    if (result.success) router.refresh();
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div
          key={row.weekDay}
          className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
            row.enabled
              ? "border-brand-200 bg-brand-50"
              : "border-slate-200 bg-white"
          }`}
        >
          {/* Toggle */}
          <label className="flex items-center gap-2 w-40 cursor-pointer select-none">
            <div
              onClick={() => handleToggle(row.weekDay, !row.enabled)}
              className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
                row.enabled ? "bg-brand-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  row.enabled ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
            <span
              className={`text-sm font-medium ${
                row.enabled ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {WEEK_DAY_LABELS[row.weekDay]}
            </span>
          </label>

          {/* Horários */}
          {row.enabled ? (
            <>
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="time"
                  value={row.startTime}
                  onChange={(e) =>
                    updateRow(row.weekDay, { startTime: e.target.value })
                  }
                  className="w-32"
                />
                <span className="text-slate-400 text-sm">até</span>
                <Input
                  type="time"
                  value={row.endTime}
                  onChange={(e) =>
                    updateRow(row.weekDay, { endTime: e.target.value })
                  }
                  className="w-32"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  loading={row.saving}
                  onClick={() => handleSave(row.weekDay)}
                >
                  Salvar
                </Button>
              </div>
              {row.error && (
                <p className="text-xs text-red-500">{row.error}</p>
              )}
            </>
          ) : (
            <span className="text-sm text-slate-400">Fechado</span>
          )}
        </div>
      ))}
    </div>
  );
}
