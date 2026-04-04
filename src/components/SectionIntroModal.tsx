"use client";

import { useEffect, useState, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Kanban,
  CalendarPlus,
  Globe,
  CheckSquare,
  BarChart3,
  PieChart,
  ScrollText,
  HelpCircle,
  GraduationCap,
  Users,
  Newspaper,
  BookOpen,
  Sparkles,
  FileText,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  SECTION_INTRO_CONTENT,
  type SectionIntroId,
} from "@/lib/section-intros";

const SECTION_ICONS: Record<SectionIntroId, LucideIcon> = {
  dashboard: LayoutDashboard,
  postulaciones: Kanban,
  calendar: CalendarPlus,
  platforms: Globe,
  checklist: CheckSquare,
  progress: BarChart3,
  analytics: PieChart,
  cv: ScrollText,
  questions: HelpCircle,
  learning: GraduationCap,
  community: Users,
  feed: Newspaper,
  resources: BookOpen,
  pitch: Sparkles,
  templates: FileText,
};

function storageKey(userId: string, sectionId: SectionIntroId) {
  return `djt_section_intro_v1:${userId}:${sectionId}`;
}

type ModalProps = {
  userId: string;
  sectionId: SectionIntroId;
};

export function SectionIntroModal({ userId, sectionId }: ModalProps) {
  const [open, setOpen] = useState(false);
  const copy = SECTION_INTRO_CONTENT[sectionId];
  const Icon = SECTION_ICONS[sectionId];

  useEffect(() => {
    if (!userId || typeof window === "undefined") return;
    try {
      if (localStorage.getItem(storageKey(userId, sectionId))) return;
      if (
        sectionId === "platforms" &&
        localStorage.getItem(`djt_platforms_intro_v1:${userId}`)
      ) {
        localStorage.setItem(storageKey(userId, "platforms"), "1");
        return;
      }
    } catch {
      return;
    }
    setOpen(true);
  }, [userId, sectionId]);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(storageKey(userId, sectionId), "1");
    } catch {
      /* ignore quota */
    }
    setOpen(false);
  }, [userId, sectionId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  if (!open) return null;

  const titleId = `section-intro-${sectionId}`;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
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
          <Icon className="h-6 w-6" aria-hidden />
        </div>

        <h2 id={titleId} className="pr-10 text-xl font-bold leading-tight text-text">
          {copy.title}
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-text-muted">{copy.lead}</p>

        <ul className="mt-4 space-y-2.5 text-sm text-text-muted">
          {copy.bullets.map((text, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

/** Modal de primera visita; usa `useAuth` internamente. */
export function AppSectionIntro({ sectionId }: { sectionId: SectionIntroId }) {
  const { user } = useAuth();
  if (!user?.id) return null;
  return <SectionIntroModal userId={user.id} sectionId={sectionId} />;
}
