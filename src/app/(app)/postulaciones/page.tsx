"use client";

import { useEffect, useState, useCallback } from "react";
import { apiStore } from "@/lib/api-store";
import { Application, APPLICATION_COLUMNS, ApplicationStatus } from "@/lib/types";
import { Plus, Trash2, ExternalLink, X, ChevronRight, Star, PartyPopper } from "lucide-react";
import Link from "next/link";
import { AppSectionIntro } from "@/components/SectionIntroModal";

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [draggedApp, setDraggedApp] = useState<string | null>(null);
  const [hiredApp, setHiredApp] = useState<Application | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    apiStore.getApplications().then(setApps).catch(() => {});
  }, []);

  const refresh = useCallback(async () => {
    const data = await apiStore.getApplications();
    setApps(data);
  }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await apiStore.addApplication({
      company: form.get("company") as string,
      role: form.get("role") as string,
      platform: form.get("platform") as string,
      salary: form.get("salary") as string,
      url: form.get("url") as string,
      notes: form.get("notes") as string,
      status: "applied",
      appliedDate: new Date().toISOString(),
    });
    setShowForm(false);
    refresh();
  };

  const handleDelete = async (id: string) => {
    await apiStore.deleteApplication(id);
    refresh();
  };

  const handleDragStart = (id: string) => setDraggedApp(id);

  const handleDrop = async (status: ApplicationStatus) => {
    if (!draggedApp) return;
    await apiStore.updateApplication(draggedApp, { status });

    if (status === "hired") {
      const refreshedApps = await apiStore.getApplications();
      const app = refreshedApps.find((a) => a.id === draggedApp);
      if (app) {
        setHiredApp(app);
        setRating(5);
        setHoverRating(0);
        setReviewName("");
        setReviewComment("");
      }
      setApps(refreshedApps);
    }

    setDraggedApp(null);
    refresh();
  };

  const handleSubmitReview = async () => {
    if (!hiredApp) return;
    if (reviewComment.trim()) {
      await apiStore.addTestimonial({
        name: reviewName.trim() || "Dev anónimo",
        role: hiredApp.role,
        company: hiredApp.company,
        rating,
        comment: reviewComment.trim(),
      });
    }
    setHiredApp(null);
  };

  return (
    <div className="space-y-6">
      <AppSectionIntro sectionId="postulaciones" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Postulaciones</h1>
          <p className="text-text-muted mt-1">Arrastrá las tarjetas para cambiar de estado</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          Nueva postulación
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Nueva postulación</h2>
              <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Empresa *</label>
                  <input name="company" required className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Rol *</label>
                  <input name="role" required className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Plataforma</label>
                  <select name="platform" className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:border-primary focus:outline-none">
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="GetonBoard">GetonBoard</option>
                    <option value="Wellfound">Wellfound</option>
                    <option value="Arc.dev">Arc.dev</option>
                    <option value="Turing">Turing</option>
                    <option value="Silver.dev">Silver.dev</option>
                    <option value="Talently">Talently</option>
                    <option value="Hireline">Hireline</option>
                    <option value="Otra">Otra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Salario</label>
                  <input name="salary" placeholder="$55,000 USD/yr" className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">URL del puesto</label>
                <input name="url" type="url" className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Notas</label>
                <textarea name="notes" rows={2} className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:border-primary focus:outline-none resize-none" />
              </div>
              <div className="flex justify-end gap-3">
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

      {/* Hired celebration modal */}
      {hiredApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
            <div className="relative px-6 pt-8 pb-4 text-center bg-gradient-to-b from-primary/10 to-transparent">
              <div className="absolute inset-x-0 top-2 flex justify-center gap-2 text-3xl animate-bounce">
                🎉 🥳 🎊
              </div>
              <PartyPopper className="h-12 w-12 text-primary mx-auto mt-6 mb-3" />
              <h2 className="text-xl font-bold text-text">¡Felicitaciones!</h2>
              <p className="text-text-muted text-sm mt-1">
                Conseguiste el puesto de <span className="font-semibold text-primary">{hiredApp.role}</span> en{" "}
                <span className="font-semibold text-text">{hiredApp.company}</span>
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-text-muted text-center">
                ¿Querés dejar una valoración para que otros devs se animen a usar DevJobTracker?
              </p>

              {/* Stars */}
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-surface-light fill-surface-light"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Tu nombre (opcional)</label>
                <input
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="Ej: Mauro Y."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Comentario</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Contá tu experiencia usando DevJobTracker..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setHiredApp(null)} className="rounded-lg px-4 py-2 text-sm text-text-muted hover:text-text transition-colors">
                Omitir
              </button>
              <button
                onClick={handleSubmitReview}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
              >
                {reviewComment.trim() ? "Enviar valoración" : "Cerrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-6 overflow-x-auto">
        {APPLICATION_COLUMNS.map((col) => {
          const colApps = apps.filter((a) => a.status === col.id);
          return (
            <div
              key={col.id}
              className="min-w-[240px] rounded-xl border border-border bg-surface p-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                <span className="text-sm font-semibold">{col.title}</span>
                <span className="ml-auto text-xs text-text-muted">{colApps.length}</span>
              </div>

              <div className="space-y-2 min-h-[100px]">
                {colApps.map((app) => (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={() => handleDragStart(app.id)}
                    className={`rounded-lg border p-3 cursor-grab active:cursor-grabbing transition-colors ${
                      col.id === "hired"
                        ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                        : "border-border bg-surface-light hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <Link href={`/postulaciones/${app.id}`} className="flex-1">
                        <p className="font-medium text-sm hover:text-primary transition-colors">{app.company}</p>
                        <p className="text-xs text-text-muted mt-0.5">{app.role}</p>
                      </Link>
                      <div className="flex gap-1">
                        {app.url && (
                          <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text p-1">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button onClick={() => handleDelete(app.id)} className="text-text-muted hover:text-red-400 p-1">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {app.salary && <p className="text-xs text-emerald-400 mt-1.5">{app.salary}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-text-muted">{app.platform}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-text-muted">{new Date(app.appliedDate).toLocaleDateString()}</span>
                        <Link href={`/postulaciones/${app.id}`} className="text-text-muted hover:text-primary">
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
