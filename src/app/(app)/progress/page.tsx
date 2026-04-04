"use client";

import { useEffect, useState } from "react";
import { apiStore } from "@/lib/api-store";
import { WeeklyProgress } from "@/lib/types";
import { Plus, X, TrendingUp, Brain, Briefcase, Globe2, MessageSquare, Target } from "lucide-react";
import { AppSectionIntro } from "@/components/SectionIntroModal";

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function getWeekLabel(weekStart: string): string {
  const start = new Date(weekStart + "T12:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${start.toLocaleDateString("es-AR", opts)} - ${end.toLocaleDateString("es-AR", opts)}`;
}

const WEEKLY_GOALS = {
  problemsSolved: 7,
  applicationsSubmitted: 10,
  englishMinutes: 210,
  interviewsCompleted: 2,
};

interface ProgressBarProps {
  current: number;
  goal: number;
  color: string;
  label: string;
  icon: typeof Brain;
  unit: string;
}

function GoalCard({ current, goal, color, label, icon: Icon, unit }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((current / goal) * 100));
  const achieved = current >= goal;

  return (
    <div className={`rounded-xl border p-4 ${achieved ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-surface"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-end justify-between mb-2">
        <span className="text-2xl font-bold">
          {current}
          <span className="text-sm font-normal text-text-muted"> / {goal} {unit}</span>
        </span>
        <span className={`text-sm font-semibold ${achieved ? "text-emerald-400" : "text-text-muted"}`}>
          {pct}%
        </span>
      </div>
      <div className="w-full bg-surface-light rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${achieved ? "bg-emerald-500" : color.replace("text-", "bg-")}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const [weeks, setWeeks] = useState<WeeklyProgress[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    apiStore.getWeeklyProgress().then(setWeeks).catch(() => {});
  }, []);

  const currentWeek = getWeekStart(new Date());
  const currentWeekData = weeks.find((w) => w.weekStart === currentWeek) || {
    weekStart: currentWeek,
    problemsSolved: 0,
    applicationsSubmitted: 0,
    englishMinutes: 0,
    interviewsCompleted: 0,
  };

  const totalProblems = weeks.reduce((sum, w) => sum + w.problemsSolved, 0);
  const totalApps = weeks.reduce((sum, w) => sum + w.applicationsSubmitted, 0);
  const totalEnglish = weeks.reduce((sum, w) => sum + w.englishMinutes, 0);
  const totalInterviews = weeks.reduce((sum, w) => sum + w.interviewsCompleted, 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const progress: WeeklyProgress = {
      weekStart: currentWeek,
      problemsSolved: parseInt(form.get("problems") as string) || 0,
      applicationsSubmitted: parseInt(form.get("applications") as string) || 0,
      englishMinutes: parseInt(form.get("english") as string) || 0,
      interviewsCompleted: parseInt(form.get("interviews") as string) || 0,
    };
    await apiStore.addWeeklyProgress(progress);
    const data = await apiStore.getWeeklyProgress();
    setWeeks(data);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <AppSectionIntro sectionId="progress" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Progreso semanal</h1>
          <p className="text-text-muted mt-1">
            Registrá lo que hacés cada semana para ver tu evolución
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          Actualizar semana
        </button>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Semana actual: {getWeekLabel(currentWeek)}</h2>
        </div>
        <p className="text-sm text-text-muted">
          Estas son tus metas semanales. Hacé click en &quot;Actualizar semana&quot; para registrar tu progreso. Los números se acumulan semana a semana.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <GoalCard
          current={currentWeekData.problemsSolved}
          goal={WEEKLY_GOALS.problemsSolved}
          color="text-purple-400"
          label="Problemas de algoritmos"
          icon={Brain}
          unit="problemas"
        />
        <GoalCard
          current={currentWeekData.applicationsSubmitted}
          goal={WEEKLY_GOALS.applicationsSubmitted}
          color="text-blue-400"
          label="Postulaciones enviadas"
          icon={Briefcase}
          unit="apps"
        />
        <GoalCard
          current={currentWeekData.englishMinutes}
          goal={WEEKLY_GOALS.englishMinutes}
          color="text-emerald-400"
          label="Minutos de inglés"
          icon={Globe2}
          unit="min"
        />
        <GoalCard
          current={currentWeekData.interviewsCompleted}
          goal={WEEKLY_GOALS.interviewsCompleted}
          color="text-amber-400"
          label="Entrevistas realizadas"
          icon={MessageSquare}
          unit="entrevistas"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total algoritmos", value: totalProblems, color: "text-purple-400" },
          { label: "Total postulaciones", value: totalApps, color: "text-blue-400" },
          { label: "Total min inglés", value: totalEnglish, color: "text-emerald-400" },
          { label: "Total entrevistas", value: totalInterviews, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Actualizar esta semana</h2>
              <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-text-muted mb-4">
              Poné el total de lo que hiciste esta semana. Esto reemplaza el registro anterior de la misma semana.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-text-muted mb-1">
                  <Brain className="h-4 w-4 text-purple-400" />
                  Problemas de algoritmos resueltos
                </label>
                <input name="problems" type="number" min={0} defaultValue={currentWeekData.problemsSolved} className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-text-muted mb-1">
                  <Briefcase className="h-4 w-4 text-blue-400" />
                  Postulaciones enviadas
                </label>
                <input name="applications" type="number" min={0} defaultValue={currentWeekData.applicationsSubmitted} className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-text-muted mb-1">
                  <Globe2 className="h-4 w-4 text-emerald-400" />
                  Minutos practicando inglés
                </label>
                <input name="english" type="number" min={0} defaultValue={currentWeekData.englishMinutes} className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-text-muted mb-1">
                  <MessageSquare className="h-4 w-4 text-amber-400" />
                  Entrevistas realizadas
                </label>
                <input name="interviews" type="number" min={0} defaultValue={currentWeekData.interviewsCompleted} className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text">
                  Cancelar
                </button>
                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {weeks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Historial de semanas</h2>
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-light text-left">
                  <th className="px-4 py-3 font-medium text-text-muted">Semana</th>
                  <th className="px-4 py-3 font-medium text-text-muted text-center">
                    <span className="hidden sm:inline">Algoritmos</span>
                    <Brain className="h-4 w-4 text-purple-400 sm:hidden inline" />
                  </th>
                  <th className="px-4 py-3 font-medium text-text-muted text-center">
                    <span className="hidden sm:inline">Postulaciones</span>
                    <Briefcase className="h-4 w-4 text-blue-400 sm:hidden inline" />
                  </th>
                  <th className="px-4 py-3 font-medium text-text-muted text-center">
                    <span className="hidden sm:inline">Inglés (min)</span>
                    <Globe2 className="h-4 w-4 text-emerald-400 sm:hidden inline" />
                  </th>
                  <th className="px-4 py-3 font-medium text-text-muted text-center">
                    <span className="hidden sm:inline">Entrevistas</span>
                    <MessageSquare className="h-4 w-4 text-amber-400 sm:hidden inline" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...weeks].reverse().map((w) => (
                  <tr key={w.weekStart} className="border-b border-border/50">
                    <td className="px-4 py-3">
                      <span className="font-medium">{getWeekLabel(w.weekStart)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${w.problemsSolved >= WEEKLY_GOALS.problemsSolved ? "text-emerald-400" : "text-purple-400"}`}>
                        {w.problemsSolved}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${w.applicationsSubmitted >= WEEKLY_GOALS.applicationsSubmitted ? "text-emerald-400" : "text-blue-400"}`}>
                        {w.applicationsSubmitted}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${w.englishMinutes >= WEEKLY_GOALS.englishMinutes ? "text-emerald-400" : "text-emerald-400"}`}>
                        {w.englishMinutes}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${w.interviewsCompleted >= WEEKLY_GOALS.interviewsCompleted ? "text-emerald-400" : "text-amber-400"}`}>
                        {w.interviewsCompleted}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {weeks.length === 0 && (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <TrendingUp className="h-12 w-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted font-medium mb-1">No hay registros todavía</p>
          <p className="text-sm text-text-muted mb-4">
            Al final de cada semana, registrá cuántos problemas resolviste, postulaciones mandaste, minutos de inglés practicaste y entrevistas tuviste.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Registrar mi primera semana
          </button>
        </div>
      )}
    </div>
  );
}
