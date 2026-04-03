"use client";

import { useEffect, useState } from "react";
import { apiStore } from "@/lib/api-store";
import { Application, Platform, ChecklistItem, INTERVIEW_TYPES, InterviewEntry } from "@/lib/types";
import { Briefcase, Globe, CheckSquare, TrendingUp, ExternalLink, Calendar, Clock, Timer, MessageSquare } from "lucide-react";
import Link from "next/link";

interface UpcomingInterview {
  interview: InterviewEntry;
  app: Application;
  daysUntil: number;
}

function getUpcomingInterviews(apps: Application[]): UpcomingInterview[] {
  const now = new Date();
  const upcoming: UpcomingInterview[] = [];

  for (const app of apps) {
    for (const interview of app.interviews || []) {
      if (interview.result !== "pending") continue;
      const interviewDate = new Date(interview.date + "T" + (interview.time || "23:59") + ":00");
      const diffMs = interviewDate.getTime() - now.getTime();
      if (diffMs < 0) continue;
      const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      upcoming.push({ interview, app, daysUntil });
    }
  }

  return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
}

function formatCountdown(days: number): { text: string; color: string } {
  if (days === 0) return { text: "HOY!", color: "text-amber-400 bg-amber-500/20" };
  if (days === 1) return { text: "MAÑANA", color: "text-amber-400 bg-amber-500/20" };
  if (days <= 3) return { text: `En ${days} días`, color: "text-blue-400 bg-blue-500/15" };
  return { text: `En ${days} días`, color: "text-zinc-400 bg-zinc-500/15" };
}

export default function DashboardPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [appsData, platformsData, checklistData] = await Promise.all([
          apiStore.getApplications(),
          apiStore.getPlatforms(),
          apiStore.getTodayChecklist(),
        ]);
        setApps(appsData);
        setPlatforms(platformsData);
        setChecklist(checklistData);
      } catch { /* ignore */ }
    };
    load();
  }, []);

  const completePlatforms = platforms.filter((p) => p.status === "complete").length;
  const todayCompleted = checklist.filter((c) => c.completed).length;
  const interviewCount = apps.filter((a) => a.status === "interview").length;
  const offerCount = apps.filter((a) => a.status === "offer").length;
  const upcomingInterviews = getUpcomingInterviews(apps);

  const stats = [
    { label: "Aplicaciones", value: apps.length, icon: Briefcase, color: "text-blue-400" },
    { label: "Plataformas activas", value: `${completePlatforms}/${platforms.length}`, icon: Globe, color: "text-emerald-400" },
    { label: "Checklist hoy", value: `${todayCompleted}/${checklist.length}`, icon: CheckSquare, color: "text-amber-400" },
    { label: "Entrevistas activas", value: interviewCount, icon: TrendingUp, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-text-muted mt-1">Resumen de tu búsqueda laboral</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <span className="text-sm text-text-muted">{s.label}</span>
            </div>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {offerCount > 0 && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-emerald-400 font-semibold">
            Tenés {offerCount} {offerCount === 1 ? "oferta" : "ofertas"} activa{offerCount !== 1 && "s"}!
          </p>
        </div>
      )}

      {/* Upcoming interviews */}
      {upcomingInterviews.length > 0 && (
        <div className={`rounded-xl border p-5 ${
          upcomingInterviews[0].daysUntil <= 1
            ? "border-amber-500/40 bg-amber-500/5"
            : "border-border bg-surface"
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold">Próximas entrevistas</h2>
          </div>
          <div className="space-y-3">
            {upcomingInterviews.slice(0, 5).map(({ interview, app, daysUntil }) => {
              const typeInfo = INTERVIEW_TYPES.find((t) => t.id === interview.type);
              const countdown = formatCountdown(daysUntil);
              return (
                <Link
                  key={interview.id}
                  href={`/applications/${app.id}`}
                  className="flex items-center gap-4 rounded-lg border border-border bg-surface-light p-3 hover:border-primary/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{app.company}</span>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${typeInfo?.color}`}>
                        {typeInfo?.label}
                      </span>
                    </div>
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
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shrink-0 ${countdown.color}`}>
                    <Timer className="h-3 w-3" />
                    {countdown.text}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Checklist de hoy</h2>
            <Link href="/checklist" className="text-sm text-primary hover:underline">Ver todo</Link>
          </div>
          {checklist.length === 0 ? (
            <p className="text-text-muted text-sm">No hay items para hoy</p>
          ) : (
            <ul className="space-y-2">
              {checklist.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${item.completed ? "bg-emerald-500" : "bg-zinc-600"}`} />
                  <span className={`text-sm ${item.completed ? "line-through text-text-muted" : "text-text"}`}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Plataformas</h2>
            <Link href="/platforms" className="text-sm text-primary hover:underline">Gestionar</Link>
          </div>
          <ul className="space-y-2">
            {platforms.slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      p.status === "complete" ? "bg-emerald-500" : p.status === "pending" ? "bg-amber-500" : "bg-zinc-600"
                    }`}
                  />
                  <span className="text-sm">{p.name}</span>
                </div>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Aplicaciones recientes</h2>
          <Link href="/applications" className="text-sm text-primary hover:underline">Ver kanban</Link>
        </div>
        {apps.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-muted mb-3">No tenés aplicaciones todavía</p>
            <Link
              href="/applications"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Agregar primera aplicación
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  <th className="pb-2 font-medium">Empresa</th>
                  <th className="pb-2 font-medium">Rol</th>
                  <th className="pb-2 font-medium">Plataforma</th>
                  <th className="pb-2 font-medium">Estado</th>
                  <th className="pb-2 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {apps.slice(0, 5).map((app) => (
                  <tr key={app.id} className="border-b border-border/50">
                    <td className="py-2.5">
                      <Link href={`/applications/${app.id}`} className="font-medium hover:text-primary transition-colors">
                        {app.company}
                      </Link>
                    </td>
                    <td className="py-2.5 text-text-muted">{app.role}</td>
                    <td className="py-2.5 text-text-muted">{app.platform}</td>
                    <td className="py-2.5">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        app.status === "offer" ? "bg-emerald-500/20 text-emerald-400" :
                        app.status === "interview" ? "bg-amber-500/20 text-amber-400" :
                        app.status === "rejected" ? "bg-red-500/20 text-red-400" :
                        app.status === "applied" ? "bg-blue-500/20 text-blue-400" :
                        "bg-zinc-500/20 text-zinc-400"
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-text-muted">{new Date(app.appliedDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
