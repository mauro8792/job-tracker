"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Rocket,
  Kanban,
  CheckSquare,
  BarChart3,
  FileText,
  Globe,
  ArrowRight,
  Star,
  Quote,
  Check,
  Sparkles,
} from "lucide-react";
import { Testimonial } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { getGoogleLoginUrl } from "@/lib/api";

const FEATURES = [
  { icon: Globe, title: "Plataformas centralizadas", description: "Gestioná tu presencia en LinkedIn, Turing, GetonBoard, Wellfound, Arc.dev y más desde un solo lugar." },
  { icon: Kanban, title: "Kanban de postulaciones", description: "Seguí el estado de cada postulación: Wishlist → Applied → Interview → Offer." },
  { icon: CheckSquare, title: "Checklist diaria", description: "No te olvides de practicar algoritmos, revisar alertas y practicar inglés todos los días." },
  { icon: BarChart3, title: "Progreso semanal", description: "Visualizá cuántos problemas resolviste, cuántas postulaciones mandaste y más." },
  { icon: FileText, title: "Templates de respuestas", description: "Templates listos para behavioral interviews, motivación y preguntas técnicas." },
  { icon: Rocket, title: "7 días gratis", description: "Probá todas las features sin compromiso. Después elegí el plan que mejor te sirva." },
];

const LANDING_PLANS: {
  name: string;
  tagline: string;
  icon: typeof Sparkles;
  featured?: boolean;
  bullets: string[];
}[] = [
  {
    name: "Free",
    tagline: "Para organizar tu búsqueda sin fricción.",
    icon: Rocket,
    bullets: [
      "Dashboard, Kanban de postulaciones y checklist diaria",
      "Plataformas y seguimiento en un solo lugar",
      "Hasta 10 postulaciones en el plan gratuito",
      "Progreso semanal y recursos para prepararte",
    ],
  },
  {
    name: "Pro",
    tagline: "Todo el alcance de la herramienta, sin techos en lo esencial.",
    icon: Sparkles,
    featured: true,
    bullets: [
      "Postulaciones ilimitadas",
      "Analytics avanzados y vista de embudo",
      "Mi CV, pitch para entrevistas y templates Pro",
      "Learning Paths, banco de preguntas y comunidad",
      "Incluye todo lo del plan Free",
    ],
  },
];

export default function LandingPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"}/testimonials`)
      .then((r) => r.json())
      .then((json) => setTestimonials(json.data ?? json))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex min-w-0 items-center gap-2">
            <Rocket className="h-7 w-7 shrink-0 text-primary" aria-hidden />
            <span className="truncate text-lg font-bold sm:text-xl">DevJobTracker</span>
          </div>
          {!loading && isAuthenticated ? (
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              {user?.avatar && (
                <img src={user.avatar} alt="" className="h-5 w-5 rounded-full" />
              )}
              Ir al dashboard
            </Link>
          ) : !loading ? (
            <a
              href={getGoogleLoginUrl()}
              className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Ingresar con Google
            </a>
          ) : null}
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-light px-4 py-1.5 text-sm text-text-muted mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Para devs de LATAM buscando trabajo remoto
        </div>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Organizá tu búsqueda laboral{" "}
          <span className="text-primary">como un pro</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-text-muted leading-relaxed">
          Centralizá tus plataformas, trackeá tus postulaciones, preparate para entrevistas
          y medí tu progreso. Todo en un solo lugar.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          {!loading && isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Ir al dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <a
              href={getGoogleLoginUrl()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Empezar con Google
              <ArrowRight className="h-5 w-5" />
            </a>
          )}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-base font-medium text-text-muted transition-colors hover:bg-surface-light hover:text-text"
          >
            Ver en GitHub
          </a>
        </div>
      </section>

      <section className="border-t border-border bg-surface px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold mb-4">Todo lo que necesitás</h2>
          <p className="text-center text-text-muted mb-12 max-w-xl mx-auto">
            Diseñado por devs, para devs. Cada feature resuelve un problema real de la búsqueda laboral.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-surface-light p-6 transition-colors hover:border-primary/40"
              >
                <f.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-light/30 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold mb-3">Dos planes</h2>
          <p className="text-center text-text-muted mb-12 max-w-lg mx-auto">
            Mismo producto: elegís cuánto querés profundizar. Sin precios en la web; los detalles los ves al crear tu cuenta.
          </p>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10 max-w-4xl mx-auto">
            {LANDING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 flex flex-col ${
                  plan.featured
                    ? "border-primary/40 bg-surface shadow-lg shadow-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-surface"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`rounded-xl p-2.5 ${
                      plan.featured ? "bg-primary/15 text-primary" : "bg-surface-light text-text-muted"
                    }`}
                  >
                    <plan.icon className="h-6 w-6" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text">{plan.name}</h3>
                    <p className="text-sm text-text-muted mt-0.5">{plan.tagline}</p>
                  </div>
                </div>
                <ul className="space-y-3 flex-1">
                  {plan.bullets.map((line) => (
                    <li key={line} className="flex gap-3 text-sm text-text-muted">
                      <Check
                        className={`h-5 w-5 shrink-0 mt-0.5 ${
                          plan.featured ? "text-primary" : "text-emerald-500/90"
                        }`}
                        aria-hidden
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="border-t border-border px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold mb-4">Devs que consiguieron trabajo</h2>
            <p className="text-center text-text-muted mb-12 max-w-xl mx-auto">
              Historias reales de desarrolladores que organizaron su búsqueda laboral con DevJobTracker y lograron su objetivo.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.id} className="rounded-xl border border-border bg-surface p-6 relative">
                  <Quote
                    className="pointer-events-none absolute top-3 right-4 h-10 w-10 text-primary/50"
                    strokeWidth={1.25}
                    aria-hidden
                  />
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s <= t.rating ? "fill-amber-400 text-amber-400" : "text-surface-light fill-surface-light"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-text leading-relaxed mb-4">&ldquo;{t.comment}&rdquo;</p>
                  <div className="border-t border-border pt-3 flex items-center gap-3">
                    {t.avatar ? (
                      <img
                        src={t.avatar}
                        alt=""
                        className="h-10 w-10 rounded-full border border-border shrink-0 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                        {t.name?.[0] ?? "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text">{t.name}</p>
                      <p className="text-xs text-text-muted">
                        {t.role} en <span className="text-primary">{t.company}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-border px-4 py-6 text-center text-sm text-text-muted">
        DevJobTracker
      </footer>
    </div>
  );
}
