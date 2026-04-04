"use client";

import { useEffect, useMemo, useState } from "react";
import { apiStore } from "@/lib/api-store";
import { Application, ChecklistItem, WeeklyProgress, INTERVIEW_TYPES } from "@/lib/types";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Area, AreaChart,
  ComposedChart,
} from "recharts";
import {
  TrendingUp, Target, Users, Trophy, Briefcase, Calendar,
  CheckCircle2, XCircle, ArrowRight, Zap, Sparkles, Lightbulb,
} from "lucide-react";
import { AppSectionIntro } from "@/components/SectionIntroModal";

const COLORS = {
  primary: "#7c3aed",
  blue: "#3b82f6",
  amber: "#f59e0b",
  emerald: "#10b981",
  red: "#ef4444",
  pink: "#ec4899",
  cyan: "#06b6d4",
  zinc: "#71717a",
};

const PIE_COLORS = [COLORS.blue, COLORS.primary, COLORS.amber, COLORS.emerald, COLORS.pink, COLORS.cyan, COLORS.red, COLORS.zinc];

const SMALL_SAMPLE = 5;

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  x.setDate(diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseDay(s: string): Date {
  const t = Date.parse(s);
  return Number.isNaN(t) ? new Date() : new Date(t);
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-text mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

type Insight = { title: string; body: string; tone: "default" | "amber" | "emerald" };

function buildInsight(args: {
  totalApps: number;
  activeApps: number;
  interviewCount: number;
  interviewRate: number;
  offerRate: number;
  hired: number;
  rejected: number;
  avgAppsPerWeek: number;
  weeksTracked: number;
}): Insight {
  const {
    totalApps,
    activeApps,
    interviewCount,
    interviewRate,
    offerRate,
    hired,
    rejected,
    avgAppsPerWeek,
    weeksTracked,
  } = args;

  if (totalApps < 3) {
    return {
      title: "Todavía estás armando tu muestra",
      body: "Con menos de 3 postulaciones los porcentajes del embudo no son representativos. Objetivo: sumar volumen y registrar cada entrevista para ver tendencias reales en unas semanas.",
      tone: "amber",
    };
  }

  if (hired > 0) {
    return {
      title: "¡Conseguiste trabajo!",
      body: "Tu embudo llegó a Hired. Si querés comparar búsquedas futuras, seguí registrando postulaciones desde el inicio de cada proceso.",
      tone: "emerald",
    };
  }

  if (interviewCount >= 3 && offerRate < 5 && hired === 0) {
    return {
      title: "Llegás a entrevista; falta cerrar oferta",
      body: "Tenés volumen de entrevistas pero aún sin oferta. Suele ayudar: pedir feedback cuando cortan, practicar behavioral y negociación, y revisar si el CV refleja el impacto que contás en las calls.",
      tone: "default",
    };
  }

  if (totalApps >= 5 && interviewRate < 12 && weeksTracked >= 2) {
    return {
      title: "Muchas postulaciones, pocas entrevistas",
      body: "El ratio entrevistas/postulaciones está bajo. Revisá: calidad del CV (ATS), carta de presentación, roles alineados a tu perfil, y volumen en las plataformas donde mejor te responden.",
      tone: "amber",
    };
  }

  if (avgAppsPerWeek > 0 && avgAppsPerWeek < 2 && totalApps >= 3) {
    return {
      title: "Ritmo de postulaciones moderado",
      body: "Un ritmo de ~3–5 postulaciones por semana suele mantener el pipeline activo (según tu disponibilidad). Si querés más entrevistas, el primer dial suele ser subir volumen o mejorar conversión del CV.",
      tone: "default",
    };
  }

  if (rejected > activeApps * 0.4 && totalApps >= 5) {
    return {
      title: "Muchos rechazos en pipeline",
      body: "Hay varios rechazos registrados. Es normal en búsqueda activa; sirve para ajustar expectativa salarial, seniority del rol o preparación en entrevistas técnicas.",
      tone: "default",
    };
  }

  return {
    title: "Seguí registrando cada paso",
    body: "Cuanto más completo esté el Kanban y las fechas de entrevistas, más clara será la foto en el tiempo: dónde se atasca el embudo y si el checklist acompaña.",
    tone: "emerald",
  };
}

export default function AnalyticsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [progress, setProgress] = useState<WeeklyProgress[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [appsData, checklistData, progressData] = await Promise.all([
          apiStore.getApplications(),
          apiStore.getAllChecklist(),
          apiStore.getWeeklyProgress(),
        ]);
        setApps(appsData);
        setChecklist(checklistData);
        setProgress(progressData);
      } catch {
        /* ignore */
      }
    };
    void load();
  }, []);

  const journey = useMemo(() => {
    if (apps.length === 0) return null;
    const dates = apps.map((a) => parseDay(a.appliedDate).getTime());
    const startMs = Math.min(...dates);
    const start = new Date(startMs);
    const now = new Date();
    const diffDays = Math.max(1, Math.ceil((now.getTime() - startMs) / (86400000)));
    const weekMs = 7 * 86400000;
    const weeksTracked = Math.max(1, Math.ceil((now.getTime() - startMs) / weekMs));
    return {
      start,
      diffDays,
      weeksTracked,
      label: start.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" }),
    };
  }, [apps]);

  const statusCounts = {
    wishlist: apps.filter((a) => a.status === "wishlist").length,
    applied: apps.filter((a) => a.status === "applied").length,
    interview: apps.filter((a) => a.status === "interview").length,
    offer: apps.filter((a) => a.status === "offer").length,
    hired: apps.filter((a) => a.status === "hired").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  const totalApps = apps.length;
  const activeApps = totalApps - statusCounts.rejected;
  const allInterviews = apps.flatMap((a) => a.interviews || []);

  const interviewRate = totalApps > 0
    ? ((statusCounts.interview + statusCounts.offer + statusCounts.hired) / totalApps) * 100
    : 0;
  const offerRate = totalApps > 0 ? ((statusCounts.offer + statusCounts.hired) / totalApps) * 100 : 0;

  const avgAppsPerWeek = journey ? totalApps / journey.weeksTracked : 0;

  const insight = useMemo(
    () =>
      buildInsight({
        totalApps,
        activeApps,
        interviewCount: allInterviews.length,
        interviewRate,
        offerRate,
        hired: statusCounts.hired,
        rejected: statusCounts.rejected,
        avgAppsPerWeek,
        weeksTracked: journey?.weeksTracked ?? 1,
      }),
    [
      totalApps,
      activeApps,
      allInterviews.length,
      interviewRate,
      offerRate,
      statusCounts.hired,
      statusCounts.rejected,
      avgAppsPerWeek,
      journey?.weeksTracked,
    ],
  );

  const funnelData = [
    { stage: "Applied", count: statusCounts.applied + statusCounts.interview + statusCounts.offer + statusCounts.hired, color: COLORS.blue },
    { stage: "Interview", count: statusCounts.interview + statusCounts.offer + statusCounts.hired, color: COLORS.amber },
    { stage: "Offer", count: statusCounts.offer + statusCounts.hired, color: COLORS.emerald },
    { stage: "Hired", count: statusCounts.hired, color: COLORS.primary },
  ];

  const platformMap: Record<string, number> = {};
  apps.forEach((a) => {
    platformMap[a.platform] = (platformMap[a.platform] || 0) + 1;
  });
  const platformData = Object.entries(platformMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  const weeklyAppsData = useMemo(() => {
    const map = new Map<number, number>();
    apps.forEach((a) => {
      const w = startOfWeek(parseDay(a.appliedDate)).getTime();
      map.set(w, (map.get(w) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((x, y) => x[0] - y[0])
      .map(([ts, count]) => ({
        week: new Date(ts).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }),
        count,
      }));
  }, [apps]);

  const interviewsOverTime = useMemo(() => {
    const map = new Map<number, number>();
    allInterviews.forEach((i) => {
      const w = startOfWeek(parseDay(i.date)).getTime();
      map.set(w, (map.get(w) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((x, y) => x[0] - y[0])
      .map(([ts, count]) => ({
        week: new Date(ts).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }),
        entrevistas: count,
      }));
  }, [allInterviews]);

  const interviewTypeMap: Record<string, number> = {};
  allInterviews.forEach((i) => {
    interviewTypeMap[i.type] = (interviewTypeMap[i.type] || 0) + 1;
  });
  const interviewTypeData = Object.entries(interviewTypeMap).map(([type, value]) => {
    const info = INTERVIEW_TYPES.find((t) => t.id === type);
    return { name: info?.label || type, value };
  });

  const dateGroups: Record<string, { total: number; done: number }> = {};
  checklist.forEach((item) => {
    if (!dateGroups[item.date]) dateGroups[item.date] = { total: 0, done: 0 };
    dateGroups[item.date].total++;
    if (item.completed) dateGroups[item.date].done++;
  });
  const checklistData = Object.entries(dateGroups)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([date, { total, done }]) => ({
      date: new Date(date).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }),
      completado: total > 0 ? Math.round((done / total) * 100) : 0,
    }));

  const checklistAllZero = checklistData.length > 0 && checklistData.every((d) => d.completado === 0);

  const progressData = progress.slice(-8).map((w) => ({
    week: new Date(w.weekStart).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }),
    Algoritmos: w.problemsSolved,
    Postulaciones: w.applicationsSubmitted,
    "Inglés (min)": w.englishMinutes,
    Entrevistas: w.interviewsCompleted,
  }));

  const passedInterviews = allInterviews.filter((i) => i.result === "passed").length;
  const failedInterviews = allInterviews.filter((i) => i.result === "failed").length;
  const pendingInterviews = allInterviews.filter((i) => !i.result || i.result === "pending").length;

  const hasData = totalApps > 0;
  const ratesReliable = totalApps >= SMALL_SAMPLE;
  const insightBorder =
    insight.tone === "amber"
      ? "border-amber-500/25 bg-amber-500/5"
      : insight.tone === "emerald"
        ? "border-emerald-500/25 bg-emerald-500/5"
        : "border-primary/20 bg-primary/5";

  return (
    <div className="space-y-6">
      <AppSectionIntro sectionId="analytics" />
      <div>
        <h1 className="text-2xl font-bold text-text">Tu progreso</h1>
        <p className="text-text-muted text-sm mt-1">
          Vista general de tu búsqueda en el tiempo: postulaciones, entrevistas y señales para decidir si subir volumen o ajustar conversión.
        </p>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-16 text-center text-text-muted flex flex-col items-center gap-3">
          <TrendingUp className="h-12 w-12 opacity-30" />
          <p className="font-medium">Todavía no hay datos</p>
          <p className="text-xs max-w-sm">
            Cargá postulaciones en el Kanban con fecha de postulación. Acá vas a ver ritmo semanal, entrevistas y embudo desde el día uno.
          </p>
        </div>
      ) : (
        <>
          {journey && (
            <div className="rounded-xl border border-border bg-surface/80 px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-2 text-text">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <span>
                  Búsqueda activa desde <strong className="text-text">{journey.label}</strong>
                  <span className="text-text-muted font-normal"> · {journey.diffDays} días · ~{avgAppsPerWeek.toFixed(1)} postulaciones/semana (promedio)</span>
                </span>
              </div>
            </div>
          )}

          <div className={`rounded-xl border p-4 ${insightBorder}`}>
            <div className="flex gap-3">
              <div className="shrink-0 mt-0.5">
                <Lightbulb className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-text flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  {insight.title}
                </p>
                <p className="text-sm text-text-muted mt-1 leading-relaxed">{insight.body}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Total postulaciones", value: String(totalApps), icon: Briefcase, color: "text-blue-400", bg: "bg-blue-500/10", hint: null as string | null },
              { label: "En proceso (no rechazadas)", value: String(activeApps), icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10", hint: null },
              { label: "Entrevistas registradas", value: String(allInterviews.length), icon: Users, color: "text-purple-400", bg: "bg-purple-500/10", hint: null },
              {
                label: "Llegan a entrevista",
                value: ratesReliable ? `${interviewRate.toFixed(0)}%` : "—",
                icon: Target,
                color: "text-cyan-400",
                bg: "bg-cyan-500/10",
                hint: ratesReliable ? "de tus postulaciones" : `Necesitás ≥${SMALL_SAMPLE} apps para un % estable`,
              },
              {
                label: "Llegan a oferta",
                value: ratesReliable ? `${offerRate.toFixed(0)}%` : "—",
                icon: Trophy,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                hint: ratesReliable ? "de tus postulaciones" : `Necesitás ≥${SMALL_SAMPLE} apps para un % estable`,
              },
              { label: "Hired", value: String(statusCounts.hired), icon: Calendar, color: "text-primary", bg: "bg-primary/10", hint: null },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-surface p-4">
                <div className={`inline-flex rounded-lg p-2 ${stat.bg} mb-2`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-xl font-bold text-text">{stat.value}</p>
                <p className="text-[11px] text-text-muted mt-0.5 leading-tight">{stat.label}</p>
                {stat.hint && <p className="text-[10px] text-amber-400/90 mt-1.5 leading-tight">{stat.hint}</p>}
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-5 lg:col-span-2">
              <h3 className="font-semibold text-text mb-1 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Postulaciones por semana
              </h3>
              <p className="text-xs text-text-muted mb-4">Desde tu primera postulación registrada (ritmo de salida al mercado).</p>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={weeklyAppsData} margin={{ left: 0, right: 10, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="week" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" name="Postulaciones" stroke={COLORS.primary} fill="url(#colorApps)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              {weeklyAppsData.length <= 1 && (
                <p className="text-xs text-text-muted text-center mt-2">
                  Con más semanas de datos vas a ver si mantenés ritmo o hubo huecos sin aplicar.
                </p>
              )}
            </div>

            {interviewsOverTime.length > 0 && (
              <div className="rounded-xl border border-border bg-surface p-5 lg:col-span-2">
                <h3 className="font-semibold text-text mb-1 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Entrevistas por semana
                </h3>
                <p className="text-xs text-text-muted mb-4">Según la fecha de cada entrevista en tus postulaciones.</p>
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={interviewsOverTime} margin={{ left: 0, right: 10, top: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="week" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="entrevistas" name="Entrevistas" fill={COLORS.amber} radius={[4, 4, 0, 0]} barSize={28} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Embudo (postulaciones → hired)
              </h3>
              <div className="space-y-3">
                {funnelData.map((step, i) => {
                  const maxCount = funnelData[0].count || 1;
                  const pct = maxCount > 0 ? (step.count / maxCount) * 100 : 0;
                  const conversionFromPrev =
                    i > 0 && funnelData[i - 1].count > 0
                      ? ((step.count / funnelData[i - 1].count) * 100).toFixed(0)
                      : null;
                  return (
                    <div key={step.stage}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text">{step.stage}</span>
                          {conversionFromPrev && (
                            <span className="text-[10px] text-text-muted flex items-center gap-0.5">
                              <ArrowRight className="h-2.5 w-2.5" /> {conversionFromPrev}%
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-bold" style={{ color: step.color }}>
                          {step.count}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-surface-light overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: step.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {statusCounts.rejected > 0 && (
                <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-xs text-text-muted">
                  <XCircle className="h-3.5 w-3.5 text-red-400" />
                  {statusCounts.rejected} rechazada{statusCounts.rejected !== 1 ? "s" : ""} (
                  {((statusCounts.rejected / totalApps) * 100).toFixed(0)}%)
                </div>
              )}
            </div>

            {platformData.length > 0 && (
              <div className="rounded-xl border border-border bg-surface p-5">
                <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" /> Por plataforma
                </h3>
                <div className="space-y-3">
                  {platformData.map((p, i) => {
                    const maxVal = platformData[0].value || 1;
                    const pct = (p.value / maxVal) * 100;
                    const color = PIE_COLORS[i % PIE_COLORS.length];
                    return (
                      <div key={p.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-text font-medium">{p.name}</span>
                          <span className="text-sm font-bold" style={{ color }}>
                            {p.value}
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-surface-light overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-3 border-t border-border text-xs text-text-muted">
                  {platformData.length} plataforma{platformData.length !== 1 ? "s" : ""} · {totalApps} postulación
                  {totalApps !== 1 ? "es" : ""} en total
                </div>
              </div>
            )}

            {interviewTypeData.length > 0 && (
              <div className="rounded-xl border border-border bg-surface p-5">
                <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Tipos de entrevista
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ResponsiveContainer width={200} height={180} className="max-w-full">
                    <PieChart>
                      <Pie
                        data={interviewTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {interviewTypeData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2 w-full min-w-0">
                    {interviewTypeData.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="flex-1 text-text-muted truncate">{item.name}</span>
                        <span className="font-semibold text-text">{item.value}</span>
                      </div>
                    ))}
                    {allInterviews.length > 0 && (
                      <div className="pt-2 border-t border-border space-y-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span className="text-text-muted">
                            Aprobadas: <span className="font-medium text-emerald-400">{passedInterviews}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <XCircle className="h-3 w-3 text-red-400" />
                          <span className="text-text-muted">
                            No aprobadas: <span className="font-medium text-red-400">{failedInterviews}</span>
                          </span>
                        </div>
                        {pendingInterviews > 0 && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="w-3 h-3 rounded-full bg-amber-400/30 shrink-0" />
                            <span className="text-text-muted">
                              Pendientes: <span className="font-medium text-amber-400">{pendingInterviews}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {checklistData.length > 0 && (
              <div className="rounded-xl border border-border bg-surface p-5">
                <h3 className="font-semibold text-text mb-1 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Checklist diario
                </h3>
                <p className="text-xs text-text-muted mb-3">% del checklist completado por día (últimas 2 semanas).</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={checklistData} margin={{ left: 0, right: 10, top: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="completado" name="Completado" fill={COLORS.emerald} radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
                {checklistAllZero && (
                  <p className="text-xs text-amber-400/90 mt-2">
                    Está en 0%: marcá ítems completados en el checklist diario para ver la curva de hábito.
                  </p>
                )}
              </div>
            )}

            {progressData.length > 1 && (
              <div className="rounded-xl border border-border bg-surface p-5 lg:col-span-2">
                <h3 className="font-semibold text-text mb-1 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Lo que registraste en progreso semanal
                </h3>
                <p className="text-xs text-text-muted mb-3">Desde la página Progreso (algoritmos, postulaciones, inglés, entrevistas practicadas).</p>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={progressData} margin={{ left: 0, right: 10, top: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="week" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="Algoritmos" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Postulaciones" stroke={COLORS.blue} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Inglés (min)" stroke={COLORS.amber} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Entrevistas" stroke={COLORS.emerald} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-4 mt-3 justify-center">
                  {[
                    { label: "Algoritmos", color: COLORS.primary },
                    { label: "Postulaciones", color: COLORS.blue },
                    { label: "Inglés (min)", color: COLORS.amber },
                    { label: "Entrevistas", color: COLORS.emerald },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5 text-xs text-text-muted">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
