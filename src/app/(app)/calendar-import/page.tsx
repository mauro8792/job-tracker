"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  ExternalLink,
  Loader2,
  RefreshCw,
  Link2,
  EyeOff,
} from "lucide-react";
import { apiStore } from "@/lib/api-store";
import { useAuth } from "@/lib/auth";
import type { Application, GoogleCalendarListItem, InterviewType } from "@/lib/types";
import { INTERVIEW_TYPES } from "@/lib/types";
import { GoogleCalendarMonth } from "@/components/GoogleCalendarMonth";

/** Select legible en tema oscuro (Windows/Chromium a veces pinta options en blanco). */
const SELECT_CLASS =
  "w-full rounded-lg border border-zinc-600 bg-zinc-900 text-zinc-100 px-3 py-2 text-sm [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-primary/40";
const SELECT_SM_CLASS =
  "rounded-lg border border-zinc-600 bg-zinc-900 text-zinc-100 px-2 py-1.5 text-sm [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-primary/40";
const OPTION_CLASS = "bg-zinc-900 text-zinc-100";

const OPEN_STATUSES: Application["status"][] = ["wishlist", "applied", "interview", "offer"];

function isOpenApplication(app: Application): boolean {
  return OPEN_STATUSES.includes(app.status);
}

export default function CalendarImportPage() {
  const { user, refreshProfile } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [events, setEvents] = useState<GoogleCalendarListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [days, setDays] = useState(21);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [modalEvent, setModalEvent] = useState<GoogleCalendarListItem | null>(null);
  const [applicationId, setApplicationId] = useState("");
  const [interviewType, setInterviewType] = useState<InterviewType>("hr");
  const [linking, setLinking] = useState(false);
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  /** Por defecto ocultamos lo ya vinculado: esta pantalla es una bandeja de pendientes. */
  const [showLinked, setShowLinked] = useState(false);

  const openApps = useMemo(() => apps.filter(isOpenApplication), [apps]);

  const displayEvents = useMemo(
    () => (showLinked ? events : events.filter((e) => !e.alreadyInApp)),
    [events, showLinked],
  );

  const linkedInPeriodCount = useMemo(
    () => events.filter((e) => e.alreadyInApp).length,
    [events],
  );

  const eventsByDate = useMemo(() => {
    const m = new Map<string, GoogleCalendarListItem[]>();
    for (const ev of displayEvents) {
      const k = ev.startDate;
      if (!k) continue;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(ev);
    }
    for (const arr of m.values()) {
      arr.sort((a, b) => a.startMs - b.startMs);
    }
    return m;
  }, [displayEvents]);

  const load = useCallback(async () => {
    if (!user?.calendarConnected) {
      setLoading(false);
      return;
    }
    setRefreshing(true);
    setMsg(null);
    try {
      const [appsData, cal] = await Promise.all([
        apiStore.getApplications(),
        apiStore.getCalendarUpcomingEvents(days),
      ]);
      setApps(appsData);
      setEvents(cal.events);
    } catch (e) {
      setMsg({
        type: "err",
        text: e instanceof Error ? e.message : "No se pudieron cargar los eventos",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.calendarConnected, days]);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpenModal = (ev: GoogleCalendarListItem) => {
    setModalEvent(ev);
    setApplicationId(openApps[0]?.id ?? "");
    setInterviewType("hr");
    setMsg(null);
  };

  const handleDismiss = async (googleEventId: string) => {
    setDismissingId(googleEventId);
    setMsg(null);
    try {
      await apiStore.dismissCalendarEvent(googleEventId);
      setMsg({ type: "ok", text: "Evento oculto en la app (sigue en Google Calendar)." });
      await load();
    } catch (e) {
      setMsg({
        type: "err",
        text: e instanceof Error ? e.message : "No se pudo ocultar",
      });
    } finally {
      setDismissingId(null);
    }
  };

  const handleLink = async () => {
    if (!modalEvent || !applicationId) return;
    setLinking(true);
    setMsg(null);
    try {
      await apiStore.linkCalendarEventToApplication({
        applicationId,
        googleEventId: modalEvent.id,
        type: interviewType,
      });
      setModalEvent(null);
      setMsg({ type: "ok", text: "Entrevista agregada a la aplicación." });
      await refreshProfile();
      await load();
    } catch (e) {
      setMsg({
        type: "err",
        text: e instanceof Error ? e.message : "No se pudo vincular el evento",
      });
    } finally {
      setLinking(false);
    }
  };

  const pendingCount = events.filter((e) => !e.alreadyInApp).length;

  const goPrevMonth = () => {
    setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };
  const goNextMonth = () => {
    setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarPlus className="h-7 w-7 text-primary" />
          Reuniones en Google Calendar
        </h1>
        <p className="text-text-muted mt-1 max-w-2xl">
          Las invitaciones que te mandan por mail suelen aparecer en tu calendario. Acá ves los próximos
          eventos y podés asociarlos manualmente a una postulación abierta para que queden como entrevista en
          el Kanban.
        </p>
      </div>

      {!user?.calendarConnected ? (
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-text mb-4">
            Para listar eventos necesitás conectar Google Calendar desde tu perfil.
          </p>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Ir a Mi perfil
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-text-muted">
              Próximos
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className={SELECT_SM_CLASS}
              >
                <option className={OPTION_CLASS} value={7}>
                  7 días
                </option>
                <option className={OPTION_CLASS} value={14}>
                  14 días
                </option>
                <option className={OPTION_CLASS} value={21}>
                  21 días
                </option>
                <option className={OPTION_CLASS} value={30}>
                  30 días
                </option>
                <option className={OPTION_CLASS} value={60}>
                  60 días
                </option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => load()}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-surface-light disabled:opacity-50"
            >
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Actualizar
            </button>
            {pendingCount > 0 ? (
              <span className="text-sm text-amber-400/90">
                {pendingCount} sin vincular en la app
              </span>
            ) : events.length > 0 ? (
              <span className="text-sm text-emerald-400/90">Todo vinculado en este período</span>
            ) : null}
            <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showLinked}
                onChange={(e) => setShowLinked(e.target.checked)}
                className="rounded border-zinc-600 bg-zinc-900 text-primary focus:ring-primary/40"
              />
              Mostrar ya vinculados
              {linkedInPeriodCount > 0 ? (
                <span className="text-xs text-text-muted/70">({linkedInPeriodCount})</span>
              ) : null}
            </label>
          </div>

          {msg ? (
            <p
              className={`text-sm rounded-lg px-3 py-2 ${
                msg.type === "ok" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
              }`}
            >
              {msg.text}
            </p>
          ) : null}

          {loading && !events.length ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-7 space-y-2">
                <p className="text-xs text-text-muted">
                  Tocá un bloque para asociarlo. Los que ya están en el Kanban no se muestran salvo que actives
                  &quot;Mostrar ya vinculados&quot;. Fuera del rango &quot;Próximos X días&quot; no se cargan:
                  subí los días si falta alguna reunión.
                </p>
                <GoogleCalendarMonth
                  viewMonth={viewMonth}
                  onPrevMonth={goPrevMonth}
                  onNextMonth={goNextMonth}
                  eventsByDate={eventsByDate}
                  onPickEvent={handleOpenModal}
                />
              </div>

              <div className="xl:col-span-5 rounded-xl border border-border bg-surface overflow-hidden min-h-[200px]">
                <div className="px-4 py-3 border-b border-border bg-surface-light/20">
                  <h2 className="text-sm font-semibold text-text">Lista del período</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    {showLinked
                      ? "Todos los eventos cargados; los vinculados tienen la etiqueta correspondiente."
                      : "Solo reuniones pendientes de asociar (las ya en el Kanban están ocultas)."}
                  </p>
                </div>
                <ul className="divide-y divide-border max-h-[min(70vh,560px)] overflow-y-auto">
                  {events.length === 0 ? (
                    <li className="px-4 py-8 text-center text-text-muted text-sm">
                      No hay eventos en el rango elegido.
                    </li>
                  ) : displayEvents.length === 0 ? (
                    <li className="px-4 py-8 text-center text-text-muted text-sm space-y-2">
                      <p>
                        En este período solo tenés eventos que ya vinculaste. Podés verlos en{" "}
                        <Link href="/applications" className="text-primary hover:underline">
                          Aplicaciones
                        </Link>{" "}
                        o marcar &quot;Mostrar ya vinculados&quot; arriba.
                      </p>
                    </li>
                  ) : (
                    displayEvents.map((ev) => (
                      <li
                        key={ev.id}
                        className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-text truncate">{ev.summary}</p>
                          <p className="text-sm text-text-muted mt-0.5">{ev.start}</p>
                          {ev.end ? (
                            <p className="text-xs text-text-muted/80">Fin: {ev.end}</p>
                          ) : null}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {ev.htmlLink ? (
                              <a
                                href={ev.htmlLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Abrir en Google Calendar
                              </a>
                            ) : null}
                            {ev.alreadyInApp ? (
                              <span className="text-xs rounded-full bg-zinc-500/20 text-zinc-400 px-2 py-0.5">
                                Ya en la app
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-wrap gap-2 justify-end">
                          {!ev.alreadyInApp ? (
                            <button
                              type="button"
                              onClick={() => handleOpenModal(ev)}
                              disabled={openApps.length === 0}
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary/90 px-3 py-2 text-sm font-medium text-white hover:bg-primary disabled:opacity-40"
                            >
                              <Link2 className="h-4 w-4" />
                              Asociar
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => handleDismiss(ev.id)}
                            disabled={dismissingId === ev.id}
                            title="Ocultar en la app (no borra el evento en Google)"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:bg-surface-light hover:text-text disabled:opacity-50"
                          >
                            {dismissingId === ev.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                            Ocultar
                          </button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          )}

          {openApps.length === 0 && user?.calendarConnected ? (
            <p className="text-sm text-text-muted">
              No tenés aplicaciones en etapas abiertas (wishlist, applied, interview, offer). Creá una en{" "}
              <Link href="/applications" className="text-primary hover:underline">
                Aplicaciones
              </Link>
              .
            </p>
          ) : null}
        </>
      )}

      {modalEvent ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
          <div
            className="w-full max-w-md rounded-xl border border-border bg-zinc-900 p-5 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cal-import-title"
          >
            <h2 id="cal-import-title" className="text-lg font-semibold text-text">
              Asociar reunión
            </h2>
            <p className="text-sm text-text-muted mt-1 line-clamp-3">{modalEvent.summary}</p>
            <p className="text-xs text-text-muted mt-2">{modalEvent.start}</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Aplicación</label>
                <select
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  className={SELECT_CLASS}
                >
                  {openApps.map((a) => (
                    <option key={a.id} value={a.id} className={OPTION_CLASS}>
                      {a.company} — {a.role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Tipo de entrevista</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                  className={SELECT_CLASS}
                >
                  {INTERVIEW_TYPES.map((t) => (
                    <option key={t.id} value={t.id} className={OPTION_CLASS}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {msg && modalEvent ? (
              <p
                className={`text-sm mt-3 ${
                  msg.type === "ok" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {msg.text}
              </p>
            ) : null}

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setModalEvent(null)}
                className="rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-surface-light"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleLink}
                disabled={linking || !applicationId}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50 inline-flex items-center gap-2"
              >
                {linking ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Guardar entrevista
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
