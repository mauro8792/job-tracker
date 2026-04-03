"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GoogleCalendarListItem } from "@/lib/types";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function localTodayKey(): string {
  const n = new Date();
  return `${n.getFullYear()}-${pad2(n.getMonth() + 1)}-${pad2(n.getDate())}`;
}

/** Lunes = primera columna */
function mondayPad(daySunday0: number): number {
  return (daySunday0 + 6) % 7;
}

export function GoogleCalendarMonth(props: {
  viewMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  eventsByDate: Map<string, GoogleCalendarListItem[]>;
  onPickEvent: (ev: GoogleCalendarListItem) => void;
}) {
  const { viewMonth, onPrevMonth, onNextMonth, eventsByDate, onPickEvent } = props;

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const title = useMemo(
    () =>
      new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(viewMonth),
    [viewMonth],
  );

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const pad = mondayPad(first.getDay());
    const dim = new Date(year, month + 1, 0).getDate();
    const out: {
      day: number | null;
      dateKey: string | null;
      events: GoogleCalendarListItem[];
      isToday: boolean;
    }[] = [];

    const todayK = localTodayKey();

    for (let i = 0; i < pad; i++) {
      out.push({ day: null, dateKey: null, events: [], isToday: false });
    }
    for (let d = 1; d <= dim; d++) {
      const dateKey = `${year}-${pad2(month + 1)}-${pad2(d)}`;
      const list = (eventsByDate.get(dateKey) ?? []).slice().sort((a, b) => a.startMs - b.startMs);
      out.push({
        day: d,
        dateKey,
        events: list,
        isToday: dateKey === todayK,
      });
    }
    while (out.length % 7 !== 0) {
      out.push({ day: null, dateKey: null, events: [], isToday: false });
    }
    while (out.length < 42) {
      out.push({ day: null, dateKey: null, events: [], isToday: false });
    }
    return out;
  }, [year, month, eventsByDate]);

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden flex flex-col min-h-[420px]">
      <div className="flex items-center justify-between gap-2 px-3 py-3 border-b border-border bg-surface-light/30">
        <button
          type="button"
          onClick={onPrevMonth}
          className="p-2 rounded-lg hover:bg-surface-light text-text-muted hover:text-text"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-base font-semibold text-text capitalize truncate px-2">{title}</h2>
        <button
          type="button"
          onClick={onNextMonth}
          className="p-2 rounded-lg hover:bg-surface-light text-text-muted hover:text-text"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border text-center text-[11px] font-medium text-text-muted uppercase tracking-wide">
        {WEEKDAYS.map((d) => (
          <div key={d} className="bg-surface py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-border flex-1 auto-rows-fr min-h-[320px]">
        {cells.map((cell, idx) => (
          <div
            key={idx}
            className={`bg-surface min-h-[72px] p-1 flex flex-col gap-0.5 ${
              cell.isToday ? "ring-1 ring-inset ring-primary/40 bg-primary/5" : ""
            }`}
          >
            {cell.day !== null ? (
              <span
                className={`text-xs font-medium tabular-nums shrink-0 ${
                  cell.isToday ? "text-primary" : "text-text-muted"
                }`}
              >
                {cell.day}
              </span>
            ) : (
              <span className="text-[10px] opacity-0 select-none">·</span>
            )}
            <div className="flex flex-col gap-0.5 min-h-0 overflow-hidden">
              {cell.events.slice(0, 3).map((ev) =>
                ev.alreadyInApp ? (
                  <span
                    key={ev.id}
                    title={`${ev.summary} (ya en la app)`}
                    className="text-left text-[10px] leading-tight px-1 py-0.5 rounded truncate w-full bg-zinc-600/35 text-zinc-400"
                  >
                    {ev.startTime ? `${ev.startTime} ` : ""}
                    {ev.summary}
                  </span>
                ) : (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => onPickEvent(ev)}
                    title={ev.summary}
                    className="text-left text-[10px] leading-tight px-1 py-0.5 rounded truncate w-full transition-colors bg-primary/20 text-primary hover:bg-primary/30"
                  >
                    {ev.startTime ? `${ev.startTime} ` : ""}
                    {ev.summary}
                  </button>
                ),
              )}
              {cell.events.length > 3 ? (
                <span className="text-[10px] text-text-muted pl-1">+{cell.events.length - 3} más</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
