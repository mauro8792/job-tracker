"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { BookOpen, HelpCircle, Sparkles, X } from "lucide-react";
import {
  welcomeOnboardingStorageKey,
  WELCOME_ONBOARDING_DISMISSED_EVENT,
} from "@/lib/onboarding-storage";

type Props = {
  userId: string;
  firstName?: string;
};

export function WelcomeOnboardingModal({ userId, firstName }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!userId || typeof window === "undefined") return;
    try {
      if (localStorage.getItem(welcomeOnboardingStorageKey(userId))) return;
    } catch {
      return;
    }
    setOpen(true);
  }, [userId]);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(welcomeOnboardingStorageKey(userId), "1");
    } catch {
      /* ignore quota */
    }
    setOpen(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(WELCOME_ONBOARDING_DISMISSED_EVENT, { detail: { userId } }),
      );
    }
  }, [userId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  if (!open) return null;

  const greeting = firstName?.trim() ? `${firstName}, ` : "";

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={dismiss}
      />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl shadow-black/40">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-text-muted hover:bg-surface-light hover:text-text"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 inline-flex rounded-full bg-primary/15 p-2 text-primary">
          <Sparkles className="h-6 w-6" aria-hidden />
        </div>

        <h2
          id="welcome-modal-title"
          className="pr-10 text-xl font-bold leading-tight text-text"
        >
          ¡Hola, {greeting}bienvenido/a a DevJobTracker!
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          Esta herramienta está pensada para desarrolladores en LATAM que buscan
          trabajo remoto: organizá tus postulaciones, entrevistas y seguimiento en
          un solo lugar, con un tablero tipo Kanban, calendario y recordatorios
          para no perder oportunidades.
        </p>

        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          Podés armar tu presentación personal para entrevistas, CV, plantillas y
          métricas de avance para que la
          búsqueda sea más ordenada y menos estresante.
        </p>

        <div className="mt-5 rounded-xl border border-border/80 bg-surface-light/50 p-4">
          <p className="text-sm font-medium text-text">
            La comunidad hace la diferencia
          </p>
          <p className="mt-2 text-sm text-text-muted">
            Cuando compartís contenido, ayudás a otras personas en la misma
            situación. Podés publicar{" "}
            <span className="text-text">Learning Paths</span> (rutas de estudio)
            y <span className="text-text">preguntas de entrevista</span> para
            que otros aprendan y practiquen con material real.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-text-muted">
            <li className="flex gap-2">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong className="text-text">Learning Paths:</strong> armá o
                cloná rutas públicas con temas y progreso.
              </span>
            </li>
            <li className="flex gap-2">
              <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong className="text-text">Preguntas:</strong> sumá
                ejercicios y respuestas para que la comunidad entrene entrevistas
                técnicas.
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/learning"
              className="text-primary hover:underline"
              onClick={dismiss}
            >
              Ir a Learning
            </Link>
            <span className="text-text-muted">·</span>
            <Link
              href="/questions"
              className="text-primary hover:underline"
              onClick={dismiss}
            >
              Ir a Preguntas
            </Link>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Entendido, empezar
          </button>
        </div>
      </div>
    </div>
  );
}
