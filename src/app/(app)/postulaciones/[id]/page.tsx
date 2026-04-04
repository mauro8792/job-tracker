"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiStore } from "@/lib/api-store";
import {
  Application,
  APPLICATION_COLUMNS,
  INTERVIEW_TYPES,
  InterviewEntry,
  InterviewType,
} from "@/lib/types";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  FileText,
  BookOpen,
  MessageSquare,
  X,
  Save,
  Timer,
  Pencil,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/lib/auth";

function getCountdown(date: string, time?: string): { text: string; urgency: "past" | "today" | "soon" | "future" } {
  const now = new Date();
  const interviewDate = new Date(date + "T" + (time || "12:00") + ":00");
  const diffMs = interviewDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  if (diffMs < 0) return { text: "Ya pas├│", urgency: "past" };
  if (diffDays === 0) {
    if (diffHours <= 1) return { text: "En menos de 1 hora!", urgency: "today" };
    return { text: `Hoy - en ${diffHours}h`, urgency: "today" };
  }
  if (diffDays === 1) return { text: "Ma├▒ana!", urgency: "soon" };
  if (diffDays <= 3) return { text: `En ${diffDays} d├¡as`, urgency: "soon" };
  if (diffDays <= 7) return { text: `En ${diffDays} d├¡as`, urgency: "future" };
  return { text: `En ${diffDays} d├¡as`, urgency: "future" };
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [app, setApp] = useState<Application | null>(null);
  const [journalNotes, setJournalNotes] = useState("");
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [editingInterview, setEditingInterview] = useState<InterviewEntry | null>(null);
  const [newPrepLabel, setNewPrepLabel] = useState("");
  const [saved, setSaved] = useState(false);
  const [calLoadingId, setCalLoadingId] = useState<string | null>(null);

  useEffect(() => {
    apiStore.getApplication(params.id as string).then((found) => {
      setApp(found);
      setJournalNotes(found.journalNotes || "");
    }).catch(() => {});
  }, [params.id]);

  if (!app) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-muted">Aplicaci├│n no encontrada</p>
      </div>
    );
  }

  const refresh = async () => {
    try {
      const found = await apiStore.getApplication(app.id);
      setApp(found);
    } catch { /* ignore */ }
  };

  const handleStatusChange = async (status: Application["status"]) => {
    await apiStore.updateApplication(app.id, { status });
    refresh();
  };

  const handleSaveNotes = async () => {
    await apiStore.updateApplication(app.id, { journalNotes });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddPrep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrepLabel.trim()) return;
    const prepItems = [...(app.prepItems || []), { id: uuidv4(), label: newPrepLabel.trim(), completed: false }];
    await apiStore.updateApplication(app.id, { prepItems });
    setNewPrepLabel("");
    refresh();
  };

  const handleTogglePrep = async (prepId: string) => {
    const prepItems = (app.prepItems || []).map((p) =>
      p.id === prepId ? { ...p, completed: !p.completed } : p
    );
    await apiStore.updateApplication(app.id, { prepItems });
    refresh();
  };

  const handleDeletePrep = async (prepId: string) => {
    const prepItems = (app.prepItems || []).filter((p) => p.id !== prepId);
    await apiStore.updateApplication(app.id, { prepItems });
    refresh();
  };

  const handleSubmitInterview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      type: form.get("type") as InterviewType,
      date: form.get("date") as string,
      time: (form.get("time") as string) || undefined,
      notes: form.get("notes") as string,
    };

    if (editingInterview) {
      const interviews = (app.interviews || []).map((i) =>
        i.id === editingInterview.id ? { ...i, ...data } : i
      );
      await apiStore.updateApplication(app.id, { interviews });
    } else {
      const entry: InterviewEntry = { ...data, id: uuidv4(), result: "pending" };
      const interviews: InterviewEntry[] = [...(app.interviews || []), entry];
      await apiStore.updateApplication(app.id, { interviews });
    }

    setShowInterviewForm(false);
    setEditingInterview(null);
    refresh();
  };

  const handleEditInterview = (interview: InterviewEntry) => {
    setEditingInterview(interview);
    setShowInterviewForm(true);
  };

  const handleInterviewResult = async (interviewId: string, result: "passed" | "failed" | "pending") => {
    const interviews = (app.interviews || []).map((i) =>
      i.id === interviewId ? { ...i, result } : i
    );
    await apiStore.updateApplication(app.id, { interviews });
    refresh();
  };

  const handleDeleteInterview = async (interviewId: string) => {
    const interviews = (app.interviews || []).filter((i) => i.id !== interviewId);
    await apiStore.updateApplication(app.id, { interviews });
    refresh();
  };

  const handleAddInterviewToCalendar = async (interviewId: string) => {
    setCalLoadingId(interviewId);
    try {
      const res = await apiStore.createInterviewCalendarEvent(app.id, interviewId);
      if (res.htmlLink) {
        window.open(res.htmlLink, "_blank", "noopener,noreferrer");
      }
      await refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "No se pudo crear el evento");
    } finally {
      setCalLoadingId(null);
    }
  };

  const prepCompleted = (app.prepItems || []).filter((p) => p.completed).length;
  const prepTotal = (app.prepItems || []).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/postulaciones")} className="text-text-muted hover:text-text">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{app.company}</h1>
          <p className="text-text-muted">{app.role}</p>
        </div>
        {app.url && (
          <a href={app.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted hover:text-text hover:border-primary/30">
            <ExternalLink className="h-4 w-4" /> Ver puesto
          </a>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-muted mb-1">Plataforma</p>
          <p className="font-medium">{app.platform}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-muted mb-1">Salario</p>
          <p className="font-medium">{app.salary || "No especificado"}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-muted mb-1">Aplicado</p>
          <p className="font-medium">{new Date(app.appliedDate).toLocaleDateString("es-AR")}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-sm text-text-muted mb-3">Estado actual</p>
        <div className="flex flex-wrap gap-2">
          {APPLICATION_COLUMNS.map((col) => (
            <button
              key={col.id}
              onClick={() => handleStatusChange(col.id)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                app.status === col.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-text-muted hover:border-primary/30"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${col.color}`} />
              {col.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Preparation checklist */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-400" />
              <h2 className="font-semibold">Preparaci├│n</h2>
            </div>
            {prepTotal > 0 && (
              <span className="text-xs text-text-muted">{prepCompleted}/{prepTotal}</span>
            )}
          </div>

          {prepTotal > 0 && (
            <div className="w-full bg-surface-light rounded-full h-1.5 mb-3">
              <div
                className={`h-1.5 rounded-full transition-all ${prepCompleted === prepTotal ? "bg-emerald-500" : "bg-purple-500"}`}
                style={{ width: `${prepTotal > 0 ? (prepCompleted / prepTotal) * 100 : 0}%` }}
              />
            </div>
          )}

          <div className="space-y-2 mb-3">
            {(app.prepItems || []).map((item) => (
              <div key={item.id} className="flex items-center gap-3 group">
                <button onClick={() => handleTogglePrep(item.id)}>
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-zinc-600" />
                  )}
                </button>
                <span className={`flex-1 text-sm ${item.completed ? "line-through text-text-muted" : ""}`}>
                  {item.label}
                </span>
                <button
                  onClick={() => handleDeletePrep(item.id)}
                  className="text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddPrep} className="flex gap-2">
            <input
              value={newPrepLabel}
              onChange={(e) => setNewPrepLabel(e.target.value)}
              placeholder="Ej: Repasar patrones de dise├▒o, Practicar Two Pointers..."
              className="flex-1 rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
            />
            <button type="submit" className="rounded-lg bg-primary px-3 py-2 text-sm text-white hover:bg-primary-hover">
              <Plus className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Interviews timeline */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-amber-400" />
              <h2 className="font-semibold">Entrevistas</h2>
            </div>
            <button
              onClick={() => { setEditingInterview(null); setShowInterviewForm(true); }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-text-muted hover:text-text hover:border-primary/30"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar
            </button>
          </div>

          {(app.interviews || []).length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">
              No hay entrevistas registradas todav├¡a
            </p>
          ) : (
            <div className="space-y-3">
              {[...(app.interviews || [])]
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((interview, idx) => {
                  const typeInfo = INTERVIEW_TYPES.find((t) => t.id === interview.type);
                  const countdown = interview.result === "pending" ? getCountdown(interview.date, interview.time) : null;
                  return (
                    <div key={interview.id} className="relative pl-6 group">
                      {idx < (app.interviews || []).length - 1 && (
                        <div className="absolute left-[9px] top-6 bottom-0 w-px bg-border" />
                      )}
                      <div className={`absolute left-0 top-1.5 h-[18px] w-[18px] rounded-full border-2 ${
                        interview.result === "passed" ? "border-emerald-500 bg-emerald-500/20" :
                        interview.result === "failed" ? "border-red-500 bg-red-500/20" :
                        "border-zinc-500 bg-zinc-500/20"
                      }`} />
                      <div className={`rounded-lg border p-3 ${
                        countdown?.urgency === "today" ? "border-amber-500/50 bg-amber-500/5" :
                        countdown?.urgency === "soon" ? "border-blue-500/30 bg-surface-light" :
                        "border-border bg-surface-light"
                      }`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeInfo?.color}`}>
                              {typeInfo?.label}
                            </span>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs text-text-muted">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {new Date(interview.date + "T12:00:00").toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })}
                              </p>
                              {interview.time && (
                                <p className="text-xs text-text-muted">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {interview.time}hs
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditInterview(interview)} className="text-text-muted hover:text-primary p-1">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDeleteInterview(interview.id)} className="text-text-muted hover:text-red-400 p-1">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {countdown && countdown.urgency !== "past" && (
                          <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold mt-2 ${
                            countdown.urgency === "today" ? "bg-amber-500/20 text-amber-400" :
                            countdown.urgency === "soon" ? "bg-blue-500/20 text-blue-400" :
                            "bg-zinc-500/15 text-zinc-400"
                          }`}>
                            <Timer className="h-3 w-3" />
                            {countdown.text}
                          </div>
                        )}

                        {interview.notes && <p className="text-sm text-text-muted mt-2">{interview.notes}</p>}
                        <div className="flex gap-1.5 mt-2">
                          {(["passed", "pending", "failed"] as const).map((r) => (
                            <button
                              key={r}
                              onClick={() => handleInterviewResult(interview.id, r)}
                              className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                                interview.result === r
                                  ? r === "passed" ? "bg-emerald-500/20 text-emerald-400"
                                    : r === "failed" ? "bg-red-500/20 text-red-400"
                                    : "bg-zinc-500/20 text-zinc-400"
                                  : "bg-surface text-text-muted hover:bg-surface-lighter"
                              }`}
                            >
                              {r === "passed" ? "Pas├®" : r === "failed" ? "No pas├®" : "Pendiente"}
                            </button>
                          ))}
                        </div>
                        {user?.calendarConnected ? (
                          <div className="mt-3 pt-2 border-t border-border/60">
                            {interview.calendarHtmlLink ? (
                              <a
                                href={interview.calendarHtmlLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                              >
                                <Calendar className="h-3.5 w-3.5" />
                                Abrir en Google Calendar
                              </a>
                            ) : (
                              <button
                                type="button"
                                disabled={calLoadingId === interview.id}
                                onClick={() => handleAddInterviewToCalendar(interview.id)}
                                className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-primary disabled:opacity-50"
                              >
                                {calLoadingId === interview.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Calendar className="h-3.5 w-3.5" />
                                )}
                                Agregar a Google Calendar
                              </button>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Journal / Notes */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            <h2 className="font-semibold">Notas y anotaciones</h2>
          </div>
          <button
            onClick={handleSaveNotes}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover"
          >
            {saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? "Guardado!" : "Guardar"}
          </button>
        </div>
        <textarea
          value={journalNotes}
          onChange={(e) => setJournalNotes(e.target.value)}
          rows={6}
          placeholder="Anot├í lo que necesites: qu├® te pidieron, qu├® tecnolog├¡as usan, cultura de la empresa, preguntas que te hicieron, feedback, etc."
          className="w-full rounded-lg border border-border bg-surface-light px-4 py-3 text-sm text-text leading-relaxed focus:border-primary focus:outline-none resize-y"
        />
      </div>

      {/* Interview form modal (create + edit) */}
      {showInterviewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingInterview ? "Editar entrevista" : "Nueva entrevista"}
              </h2>
              <button onClick={() => { setShowInterviewForm(false); setEditingInterview(null); }} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitInterview} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Tipo de entrevista</label>
                <select name="type" defaultValue={editingInterview?.type || "hr"} className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:border-primary focus:outline-none">
                  {INTERVIEW_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Fecha</label>
                  <input name="date" type="date" required defaultValue={editingInterview?.date || new Date().toISOString().split("T")[0]} className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Hora</label>
                  <input name="time" type="time" defaultValue={editingInterview?.time || ""} className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Notas</label>
                <textarea name="notes" rows={3} defaultValue={editingInterview?.notes || ""} placeholder="Con qui├®n, qu├® me preguntaron, qu├® tengo que preparar..." className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:border-primary focus:outline-none resize-none" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setShowInterviewForm(false); setEditingInterview(null); }} className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text">
                  Cancelar
                </button>
                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
                  {editingInterview ? "Guardar cambios" : "Agregar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
