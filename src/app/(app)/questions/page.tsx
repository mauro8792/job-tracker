"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiStore } from "@/lib/api-store";
import { Question } from "@/lib/types";
import { Plus, Search, ChevronDown, ChevronUp, Pencil, Trash2, Tag, X, Filter } from "lucide-react";

const SUGGESTED_TAGS = [
  "Node.js", "TypeScript", "JavaScript", "React", "NestJS", "Express",
  "SQL", "MongoDB", "Redis", "Docker", "AWS", "GCP", "Git",
  "System Design", "Algoritmos", "REST API", "GraphQL", "Testing",
  "Patrones de diseño", "Seguridad", "Cross / General", "Behavioral",
];

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formQ, setFormQ] = useState("");
  const [formA, setFormA] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formPublic, setFormPublic] = useState(false);
  const [customTag, setCustomTag] = useState("");

  useEffect(() => {
    setLoadError(null);
    apiStore
      .getQuestions()
      .then(setQuestions)
      .catch((e) => {
        setLoadError(e instanceof Error ? e.message : "No se pudieron cargar las preguntas");
      })
      .finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    const data = await apiStore.getQuestions();
    setQuestions(data);
  };

  const allTags = Array.from(new Set([...SUGGESTED_TAGS, ...questions.flatMap((q) => q.tags)])).sort();

  const resetForm = () => {
    setFormQ("");
    setFormA("");
    setFormTags([]);
    setFormPublic(false);
    setCustomTag("");
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formQ.trim() || !formA.trim()) return;
    const visibility = formPublic ? "public" : "private";
    if (editingId) {
      await apiStore.updateQuestion(editingId, {
        question: formQ.trim(),
        answer: formA.trim(),
        tags: formTags,
        visibility,
      });
    } else {
      await apiStore.addQuestion({
        question: formQ.trim(),
        answer: formA.trim(),
        tags: formTags,
        visibility,
      });
    }
    await refresh();
    resetForm();
  };

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setFormQ(q.question);
    setFormA(q.answer);
    setFormTags([...q.tags]);
    setFormPublic(q.visibility === "public");
    setShowForm(true);
    setExpandedId(null);
  };

  const handleDelete = async (id: string) => {
    await apiStore.deleteQuestion(id);
    await refresh();
  };

  const toggleFormTag = (tag: string) => {
    setFormTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !formTags.includes(t)) setFormTags([...formTags, t]);
    setCustomTag("");
  };

  const toggleFilter = (tag: string) => {
    setFilterTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const filtered = questions.filter((q) => {
    const matchSearch = !search || q.question.toLowerCase().includes(search.toLowerCase()) || q.answer.toLowerCase().includes(search.toLowerCase());
    const matchTags = filterTags.length === 0 || filterTags.some((t) => q.tags.includes(t));
    return matchSearch && matchTags;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Banco de Preguntas</h1>
          <p className="text-text-muted text-sm mt-1">
            {loading
              ? "Cargando…"
              : `${questions.length} pregunta${questions.length !== 1 ? "s" : ""} guardada${questions.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Nueva pregunta
        </button>
      </div>

      {loadError ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
          {loadError}. Revisá que el API esté en marcha y{" "}
          <code className="rounded bg-background/80 px-1">NEXT_PUBLIC_API_URL</code> sea correcto.
        </div>
      ) : null}

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <h2 className="text-lg font-semibold text-text">
            {editingId ? "Editar pregunta" : "Agregar pregunta"}
          </h2>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Pregunta</label>
            <textarea
              value={formQ}
              onChange={(e) => setFormQ(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Ej: ¿Qué es el Event Loop en Node.js?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Respuesta</label>
            <textarea
              value={formA}
              onChange={(e) => setFormA(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Tu respuesta..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {SUGGESTED_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleFormTag(tag)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    formTags.includes(tag) ? "bg-primary text-white" : "bg-surface-light text-text-muted hover:text-text"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                placeholder="Tag personalizado..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button onClick={addCustomTag} className="rounded-lg bg-surface-light px-3 py-1.5 text-xs text-text-muted hover:text-text transition-colors">
                Agregar
              </button>
            </div>
            {formTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formTags.map((t) => (
                  <span key={t} className="flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs text-primary">
                    {t}
                    <X className="h-3 w-3 cursor-pointer hover:text-white" onClick={() => toggleFormTag(t)} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-border bg-background/80 px-3 py-3">
            <input
              type="checkbox"
              checked={formPublic}
              onChange={(e) => setFormPublic(e.target.checked)}
              className="mt-0.5 rounded border-border text-primary focus:ring-primary/50"
            />
            <span>
              <span className="block text-sm font-medium text-text">Visible en comunidad</span>
              <span className="block text-xs text-text-muted mt-0.5">
                Otros podrán ver esta pregunta en Comunidad y clonarla a su banco.
              </span>
            </span>
          </label>

          <div className="flex gap-2 justify-end">
            <button onClick={resetForm} className="rounded-lg px-4 py-2 text-sm text-text-muted hover:text-text transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!formQ.trim() || !formA.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              {editingId ? "Guardar cambios" : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar preguntas..."
            className="w-full rounded-lg border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-text-muted shrink-0" />
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleFilter(tag)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                filterTags.includes(tag) ? "bg-primary text-white" : "bg-surface-light text-text-muted hover:text-text"
              }`}
            >
              {tag}
            </button>
          ))}
          {filterTags.length > 0 && (
            <button onClick={() => setFilterTags([])} className="text-xs text-red-400 hover:text-red-300 ml-1">
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.length === 0 ? (
          <div className="lg:col-span-2 rounded-xl border border-dashed border-border bg-surface p-10 text-center text-text-muted space-y-3">
            {questions.length === 0 ? (
              <>
                <p>No hay preguntas en tu cuenta todavía.</p>
                <p className="text-sm">
                  Para cargar el set de demo (18 preguntas), andá a{" "}
                  <Link href="/seed" className="text-primary font-medium hover:underline">
                    Seed → Cargar datos de ejemplo
                  </Link>
                  . El seed no corre solo: hay que ejecutarlo una vez desde ahí.
                </p>
                <p className="text-sm">O usá &quot;Nueva pregunta&quot; arriba para agregar la primera a mano.</p>
              </>
            ) : (
              <p>No se encontraron preguntas con esos filtros.</p>
            )}
          </div>
        ) : (
          filtered.map((q) => (
            <div key={q.id} className="rounded-xl border border-border bg-surface overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                className="flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-surface-light/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text leading-snug flex flex-wrap items-center gap-2">
                    {q.question}
                    {q.visibility === "public" ? (
                      <span className="text-[10px] font-medium rounded-full bg-emerald-500/15 text-emerald-400 px-2 py-0.5">
                        Público
                      </span>
                    ) : null}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {q.tags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
                        <Tag className="h-2.5 w-2.5" /> {t}
                      </span>
                    ))}
                  </div>
                </div>
                {expandedId === q.id ? (
                  <ChevronUp className="h-4 w-4 text-text-muted shrink-0 mt-0.5" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-text-muted shrink-0 mt-0.5" />
                )}
              </button>

              {expandedId === q.id && (
                <div className="border-t border-border px-4 py-3 bg-background/50">
                  <p className="text-sm text-text whitespace-pre-wrap">{q.answer}</p>
                  <div className="flex gap-2 justify-end mt-3">
                    <button
                      onClick={() => startEdit(q)}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Pencil className="h-3 w-3" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" /> Borrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
