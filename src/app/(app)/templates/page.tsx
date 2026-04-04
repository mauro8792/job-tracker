"use client";

import { useEffect, useState, useCallback } from "react";
import { apiStore } from "@/lib/api-store";
import { AppSectionIntro } from "@/components/SectionIntroModal";
import { useAuth } from "@/lib/auth";
import { Template, TemplateCategory } from "@/lib/types";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Heart,
  Code2,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Languages,
} from "lucide-react";

const CATEGORY_META: Record<string, { label: string; icon: typeof MessageSquare; color: string }> = {
  behavioral: { label: "Behavioral", icon: MessageSquare, color: "text-blue-400 bg-blue-500/15" },
  motivation: { label: "Motivación", icon: Heart, color: "text-pink-400 bg-pink-500/15" },
  technical: { label: "Técnica", icon: Code2, color: "text-emerald-400 bg-emerald-500/15" },
  general: { label: "General", icon: Sparkles, color: "text-amber-400 bg-amber-500/15" },
};

const CATEGORY_OPTIONS: { value: TemplateCategory; label: string }[] = [
  { value: "behavioral", label: "Behavioral" },
  { value: "motivation", label: "Motivación" },
  { value: "technical", label: "Técnica" },
  { value: "general", label: "General" },
];

function readLegacyTemplatesLang(): "en" | "es" | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem("djt_templates_lang") ?? localStorage.getItem("djt_templates_lang");
    if (!raw) return null;
    if (raw === "es" || raw === "en") return raw;
    const parsed = JSON.parse(raw) as unknown;
    if (parsed === "es" || parsed === "en") return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function clearLegacyTemplatesLang() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("djt_templates_lang");
  localStorage.removeItem("djt_templates_lang");
}

export default function TemplatesPage() {
  const { user, refreshProfile, loading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [lang, setLang] = useState<"en" | "es">("en");
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  useEffect(() => {
    apiStore.getTemplates().then(setTemplates).catch(() => {});
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;

    const server = user.templatesLang;
    const legacy = readLegacyTemplatesLang();

    if (server === "en" || server === "es") {
      clearLegacyTemplatesLang();
      setLang(server);
      return;
    }

    if (legacy) {
      setLang(legacy);
      void (async () => {
        try {
          await apiStore.updateMe({ templatesLang: legacy });
          clearLegacyTemplatesLang();
          await refreshProfile();
        } catch {
          /* sigue mostrando legacy hasta que el usuario reintente */
        }
      })();
      return;
    }

    setLang("en");
  }, [authLoading, user, refreshProfile]);

  const refresh = async () => {
    const data = await apiStore.getTemplates();
    setTemplates(data);
  };

  const filtered = filter === "all" ? templates : templates.filter((t) => t.category === filter);

  const getContent = (t: Template) => {
    if (lang === "es" && t.contentEs) return t.contentEs;
    return t.content;
  };

  const handleCopy = async (template: Template) => {
    await navigator.clipboard.writeText(getContent(template));
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLangToggle = useCallback(async () => {
    const prev = lang;
    const newLang = prev === "en" ? "es" : "en";
    setLang(newLang);
    try {
      await apiStore.updateMe({ templatesLang: newLang });
      await refreshProfile();
    } catch {
      setLang(prev);
    }
  }, [lang, refreshProfile]);

  const handleOpenEdit = (template: Template) => {
    setEditingTemplate({ ...template });
    setShowForm(true);
  };

  const handleOpenNew = () => {
    setEditingTemplate(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const template = {
      id: editingTemplate?.id,
      title: form.get("title") as string,
      category: form.get("category") as TemplateCategory,
      content: form.get("content") as string,
      contentEs: (form.get("contentEs") as string) || undefined,
      isCustom: editingTemplate ? editingTemplate.isCustom : true,
    };
    await apiStore.saveTemplate(template as any);
    setShowForm(false);
    setEditingTemplate(null);
    refresh();
  };

  const handleDelete = async (id: string) => {
    await apiStore.deleteTemplate(id);
    refresh();
  };

  const categories = ["all", ...new Set(templates.map((t) => t.category))];

  return (
    <div className="space-y-6">
      <AppSectionIntro sectionId="templates" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates de respuestas</h1>
          <p className="text-text-muted mt-1">
            Respuestas pre-armadas para entrevistas y formularios. Reemplazá las {"{variables}"} con tu info.
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover shrink-0"
        >
          <Plus className="h-4 w-4" /> Nuevo
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === cat
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-text-muted hover:border-primary/30"
                }`}
              >
                {cat === "all" ? "Todas" : meta?.label || cat}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleLangToggle}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
            lang === "en"
              ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
              : "border-amber-500/30 bg-amber-500/10 text-amber-400"
          }`}
        >
          <Languages className="h-4 w-4" />
          {lang === "en" ? "EN" : "ES"}
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map((t) => {
          const meta = CATEGORY_META[t.category] || CATEGORY_META.general;
          const isExpanded = expandedId === t.id;
          const content = getContent(t);

          return (
            <div key={t.id} className="rounded-xl border border-border bg-surface overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : t.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-light transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.color}`}>
                    <meta.icon className="h-3 w-3" />
                    {meta.label}
                  </span>
                  <span className="font-medium text-sm">{t.title}</span>
                  {t.isCustom && (
                    <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] text-primary font-medium">Custom</span>
                  )}
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
              </button>

              {isExpanded && (
                <div className="border-t border-border p-4">
                  {lang === "es" && !t.contentEs && (
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-400 mb-3">
                      Este template no tiene versión en español. Editalo para agregar una.
                    </div>
                  )}

                  <pre className="whitespace-pre-wrap text-sm text-text-muted font-sans leading-relaxed">
                    {content}
                  </pre>

                  {t.variables && t.variables.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="text-xs text-text-muted">Variables:</span>
                      {t.variables.map((v) => (
                        <span key={v} className="rounded bg-primary/15 px-1.5 py-0.5 text-xs text-primary font-mono">
                          {`{${v}}`}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted hover:text-text hover:border-primary/30 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                      {t.isCustom && (
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted hover:text-red-400 hover:border-red-400/30 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Borrar
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => handleCopy(t)}
                      className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted hover:text-text hover:border-primary/30 transition-colors"
                    >
                      {copiedId === t.id ? (
                        <><Check className="h-4 w-4 text-emerald-400" /> Copiado!</>
                      ) : (
                        <><Copy className="h-4 w-4" /> Copiar</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-text-muted">No hay templates con ese filtro</p>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingTemplate ? "Editar template" : "Nuevo template"}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingTemplate(null); }} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Título</label>
                  <input
                    name="title"
                    required
                    defaultValue={editingTemplate?.title || ""}
                    placeholder="Ej: Describe your experience with microservices"
                    className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Categoría</label>
                  <select name="category" defaultValue={editingTemplate?.category || "general"} className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:border-primary focus:outline-none">
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-text-muted mb-1">
                  Contenido en inglés
                  <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-[10px] text-blue-400 font-medium">EN</span>
                </label>
                <textarea
                  name="content"
                  required
                  rows={6}
                  defaultValue={editingTemplate?.content || ""}
                  placeholder="Write your template here. Use {variable_name} for placeholders..."
                  className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text leading-relaxed focus:border-primary focus:outline-none resize-y font-mono"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-text-muted mb-1">
                  Contenido en español (opcional)
                  <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-400 font-medium">ES</span>
                </label>
                <textarea
                  name="contentEs"
                  rows={6}
                  defaultValue={editingTemplate?.contentEs || ""}
                  placeholder="Escribí tu template en español. Usá {nombre_variable} para los placeholders..."
                  className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text leading-relaxed focus:border-primary focus:outline-none resize-y font-mono"
                />
              </div>
              <p className="text-xs text-text-muted">
                Tip: Usá {"{"}variable{"}"} para marcar partes que cambian según la empresa o posición. Ej: {"{"}company{"}"}, {"{"}years{"}"}, {"{"}technologies{"}"}
              </p>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setShowForm(false); setEditingTemplate(null); }} className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text">
                  Cancelar
                </button>
                <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
                  <Save className="h-4 w-4" />
                  {editingTemplate ? "Guardar cambios" : "Crear template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
