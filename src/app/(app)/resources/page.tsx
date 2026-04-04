"use client";

import { useState } from "react";
import { RESOURCES, RESOURCE_CATEGORIES, ResourceCategory } from "@/lib/resources";
import { AppSectionIntro } from "@/components/SectionIntroModal";
import { ExternalLink, Star, Zap } from "lucide-react";

const DIFFICULTY_BADGE: Record<string, string> = {
  beginner: "bg-emerald-500/15 text-emerald-400",
  intermediate: "bg-amber-500/15 text-amber-400",
  advanced: "bg-red-500/15 text-red-400",
};

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | "all">("all");
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  const filtered = RESOURCES.filter((r) => {
    if (activeCategory !== "all" && r.category !== activeCategory) return false;
    if (showFreeOnly && !r.free) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <AppSectionIntro sectionId="resources" />
      <div>
        <h1 className="text-2xl font-bold">Recursos para prepararte</h1>
        <p className="text-text-muted mt-1">
          Algoritmos, system design, inglés y más. Todo lo que necesitás para clavar las entrevistas.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === "all"
              ? "border-primary bg-primary/15 text-primary"
              : "border-border text-text-muted hover:border-primary/30"
          }`}
        >
          Todos
        </button>
        {RESOURCE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-text-muted hover:border-primary/30"
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}

        <div className="ml-auto">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showFreeOnly}
              onChange={() => setShowFreeOnly(!showFreeOnly)}
              className="accent-primary"
            />
            <span className="text-text-muted">Solo gratis</span>
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((resource) => {
          const cat = RESOURCE_CATEGORIES.find((c) => c.id === resource.category);
          return (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary/40 hover:bg-surface-light"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat?.emoji}</span>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{resource.name}</h3>
                </div>
                <ExternalLink className="h-4 w-4 text-text-muted shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <p className="text-sm text-text-muted leading-relaxed mb-3">{resource.description}</p>

              <div className="flex flex-wrap items-center gap-2">
                {resource.difficulty && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_BADGE[resource.difficulty]}`}>
                    {DIFFICULTY_LABEL[resource.difficulty]}
                  </span>
                )}
                {resource.free ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
                    <Zap className="h-3 w-3" /> Gratis
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-500/15 px-2 py-0.5 text-xs font-medium text-zinc-400">
                    <Star className="h-3 w-3" /> Pago
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {resource.tags.map((tag) => (
                  <span key={tag} className="rounded bg-surface-lighter px-1.5 py-0.5 text-[10px] text-text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-text-muted">No hay recursos con esos filtros</p>
        </div>
      )}

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <h3 className="font-semibold mb-2">Rutina diaria recomendada</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-sm">
            <p className="text-primary font-medium">Mañana (30 min)</p>
            <p className="text-text-muted mt-1">1 problema de NeetCode/LeetCode</p>
          </div>
          <div className="text-sm">
            <p className="text-primary font-medium">Mediodía (15 min)</p>
            <p className="text-text-muted mt-1">Revisar alertas y aplicar a 1-2 posiciones</p>
          </div>
          <div className="text-sm">
            <p className="text-primary font-medium">Tarde (30 min)</p>
            <p className="text-text-muted mt-1">Inglés: Cambly, YouTube o Pramp</p>
          </div>
          <div className="text-sm">
            <p className="text-primary font-medium">Noche (15 min)</p>
            <p className="text-text-muted mt-1">1 pregunta behavioral con método STAR</p>
          </div>
        </div>
      </div>
    </div>
  );
}
