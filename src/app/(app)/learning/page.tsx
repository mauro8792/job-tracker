"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiStore } from "@/lib/api-store";
import { LearningPath } from "@/lib/types";
import {
  Plus, Trash2, ExternalLink, CheckCircle2, Circle,
  ChevronDown, ChevronRight, Pencil, X, GraduationCap, Search, Filter, Tag,
} from "lucide-react";

interface RolePreset {
  label: string;
  emoji: string;
  keywords: string[];
}

const ROLE_PRESETS: RolePreset[] = [
  { label: "Full Stack Node + React", emoji: "⚡", keywords: ["Node.js", "React", "TypeScript", "JavaScript", "SQL", "MongoDB", "Docker", "Testing"] },
  { label: "Backend Node.js", emoji: "🖥️", keywords: ["Node.js", "NestJS", "TypeScript", "SQL", "MongoDB", "Redis", "Docker", "AWS", "Testing", "System Design"] },
  { label: "Frontend React", emoji: "🎨", keywords: ["React", "TypeScript", "JavaScript", "CSS", "Testing", "System Design"] },
  { label: "DevOps / Cloud", emoji: "☁️", keywords: ["Docker", "AWS", "GCP", "CI/CD", "Linux", "Kubernetes"] },
  { label: "Preparación general", emoji: "🎯", keywords: ["Algoritmos", "System Design", "Patrones de diseño", "English", "Behavioral"] },
];

const SUGGESTED_TAGS = [
  "Node.js", "TypeScript", "JavaScript", "React", "NestJS", "Express",
  "SQL", "MongoDB", "Redis", "Docker", "AWS", "GCP", "Git",
  "System Design", "Algoritmos", "REST API", "GraphQL", "Testing",
  "Patrones de diseño", "CSS", "CI/CD", "Linux", "English", "Behavioral",
];

const PATH_ICONS: Record<string, string> = {
  "Node.js": "🟢", TypeScript: "🔷", JavaScript: "🟡", React: "⚛️",
  NestJS: "🐱", "System Design": "🏗️", SQL: "🗄️", MongoDB: "🍃",
  Docker: "🐳", AWS: "☁️", Testing: "🧪", Algoritmos: "🧮",
  "Patrones de diseño": "📐", English: "🇬🇧", Redis: "🔴", GCP: "🌐",
  CSS: "🎨", Git: "🔀", Express: "⚡", GraphQL: "💠",
};

export default function LearningPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // New/Edit path form
  const [showForm, setShowForm] = useState(false);
  const [editingPathId, setEditingPathId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formIcon, setFormIcon] = useState("");
  const [formPublic, setFormPublic] = useState(false);
  const [customTag, setCustomTag] = useState("");

  // Add topic
  const [showTopicForm, setShowTopicForm] = useState<string | null>(null);
  const [topicTitle, setTopicTitle] = useState("");
  const [topicUrl, setTopicUrl] = useState("");

  useEffect(() => {
    setLoadError(null);
    apiStore
      .getLearningPaths()
      .then(setPaths)
      .catch((e) => {
        setLoadError(e instanceof Error ? e.message : "No se pudieron cargar los learning paths");
      })
      .finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    const data = await apiStore.getLearningPaths();
    setPaths(data);
  };

  const resetForm = () => {
    setFormName("");
    setFormTags([]);
    setFormIcon("");
    setFormPublic(false);
    setCustomTag("");
    setShowForm(false);
    setEditingPathId(null);
  };

  const handleSavePath = async () => {
    const name = formName.trim();
    if (!name) return;
    const icon = formIcon || PATH_ICONS[name] || (formTags.length > 0 ? PATH_ICONS[formTags[0]] : undefined) || "📚";

    const visibility = formPublic ? "public" : "private";
    if (editingPathId) {
      await apiStore.updateLearningPath(editingPathId, { name, icon, tags: formTags, visibility });
    } else {
      await apiStore.addLearningPath(name, icon, formTags, visibility);
    }
    await refresh();
    resetForm();
  };

  const startEditPath = (p: LearningPath) => {
    setEditingPathId(p.id);
    setFormName(p.name);
    setFormTags(p.tags || []);
    setFormIcon(p.icon || "");
    setFormPublic(p.visibility === "public");
    setShowForm(true);
    setExpandedId(null);
  };

  const handleDeletePath = async (id: string) => {
    await apiStore.deleteLearningPath(id);
    await refresh();
    if (expandedId === id) setExpandedId(null);
  };

  const toggleFormTag = (tag: string) => {
    setFormTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !formTags.includes(t)) setFormTags([...formTags, t]);
    setCustomTag("");
  };

  const handleAddTopic = async (pathId: string) => {
    if (!topicTitle.trim()) return;
    await apiStore.addTopic(pathId, topicTitle.trim(), topicUrl.trim() || undefined);
    await refresh();
    setTopicTitle("");
    setTopicUrl("");
    setShowTopicForm(null);
  };

  const handleToggleTopic = async (pathId: string, topicId: string) => {
    await apiStore.toggleTopic(pathId, topicId);
    await refresh();
  };

  const handleDeleteTopic = async (pathId: string, topicId: string) => {
    await apiStore.deleteTopic(pathId, topicId);
    await refresh();
  };

  const getProgress = (p: LearningPath) => {
    if (p.topics.length === 0) return 0;
    return Math.round((p.topics.filter((t) => t.completed).length / p.topics.length) * 100);
  };

  const totalTopics = paths.reduce((acc, p) => acc + p.topics.length, 0);
  const completedTopics = paths.reduce((acc, p) => acc + p.topics.filter((t) => t.completed).length, 0);
  const globalProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const activeKeywords = activePreset ? ROLE_PRESETS.find((r) => r.label === activePreset)?.keywords || [] : [];

  const filteredPaths = paths.filter((p) => {
    const nameLC = p.name.toLowerCase();
    const tagsLC = (p.tags || []).map((t) => t.toLowerCase());
    const topicNames = p.topics.map((t) => t.title.toLowerCase()).join(" ");
    const searchable = `${nameLC} ${tagsLC.join(" ")} ${topicNames}`;

    const matchSearch = !search || searchable.includes(search.toLowerCase());
    const matchPreset = activeKeywords.length === 0 || activeKeywords.some((kw) => {
      const kwLC = kw.toLowerCase();
      return nameLC.includes(kwLC) || tagsLC.some((t) => t.includes(kwLC));
    });

    return matchSearch && matchPreset;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Learning Path</h1>
          <p className="text-text-muted text-sm mt-1">
            {loading
              ? "Cargando…"
              : `${paths.length} path${paths.length !== 1 ? "s" : ""} · ${completedTopics}/${totalTopics} temas completados`}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Nuevo path
        </button>
      </div>

      {loadError ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
          {loadError}. Revisá que el API esté en marcha y la URL del backend sea correcta.
        </div>
      ) : null}

      {/* Global progress */}
      {totalTopics > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text">Progreso general</span>
            <span className="text-sm font-bold text-primary">{globalProgress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-surface-light overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${globalProgress}%` }} />
          </div>
        </div>
      )}

      {/* Search & role presets */}
      {paths.length > 0 && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, tecnología o tema..."
              className="w-full rounded-lg border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-text-muted shrink-0" />
            {ROLE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setActivePreset(activePreset === preset.label ? null : preset.label)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activePreset === preset.label ? "bg-primary text-white" : "bg-surface-light text-text-muted hover:text-text"
                }`}
              >
                {preset.emoji} {preset.label}
              </button>
            ))}
            {(search || activePreset) && (
              <button onClick={() => { setSearch(""); setActivePreset(null); }} className="text-xs text-red-400 hover:text-red-300 ml-1">
                Limpiar
              </button>
            )}
          </div>

          {activePreset && (
            <div className="rounded-lg bg-primary/5 border border-primary/15 px-3 py-2">
              <span className="text-xs text-text-muted">
                <span className="font-medium text-primary">{activePreset}</span> — Filtrando por: {activeKeywords.join(", ")}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Modal New/Edit path */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-light/30">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/15 text-xl">
                  {formIcon || "📚"}
                </div>
                <div>
                  <h2 className="text-base font-bold text-text">
                    {editingPathId ? "Editar path" : "Nuevo learning path"}
                  </h2>
                  <p className="text-xs text-text-muted">Definí qué vas a estudiar y con qué tecnologías</p>
                </div>
              </div>
              <button onClick={resetForm} className="rounded-lg p-1.5 text-text-muted hover:text-text hover:bg-surface-light transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Nombre</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Node.js Fundamentals, System Design..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Tecnologías</label>
                {formTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {formTags.map((t) => (
                      <span key={t} className="flex items-center gap-1.5 rounded-full bg-primary/15 pl-2 pr-1.5 py-1 text-xs font-medium text-primary border border-primary/20">
                        {PATH_ICONS[t] && <span className="text-[11px]">{PATH_ICONS[t]}</span>}
                        {t}
                        <button onClick={() => toggleFormTag(t)} className="rounded-full p-0.5 hover:bg-primary/20 transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.filter((t) => !formTags.includes(t)).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleFormTag(tag)}
                      className="rounded-full px-2.5 py-1 text-xs font-medium transition-colors bg-surface-light text-text-muted hover:text-text hover:bg-surface-light/80 flex items-center gap-1"
                    >
                      {PATH_ICONS[tag] && <span className="text-[10px]">{PATH_ICONS[tag]}</span>} {tag}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                    placeholder="Tag personalizado..."
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button onClick={addCustomTag} className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text hover:border-primary/30 transition-colors">
                    + Agregar
                  </button>
                </div>
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
                    Otros usuarios podrán ver este path en Comunidad y clonarlo a su cuenta.
                  </span>
                </span>
              </label>

              {/* Icon picker */}
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Ícono</label>
                <div className="flex flex-wrap gap-1.5">
                  {["📚", "🟢", "🔷", "🟡", "⚛️", "🐱", "🏗️", "🗄️", "🍃", "🐳", "☁️", "🧪", "🧮", "📐", "🇬🇧", "🔴", "🎨", "🔀", "⚡", "💠", "🎯", "🖥️", "🔒", "📊"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setFormIcon(emoji)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-base transition-all ${
                        formIcon === emoji
                          ? "bg-primary/20 ring-2 ring-primary scale-110"
                          : "bg-surface-light hover:bg-surface-light/80 hover:scale-105"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-light/20">
              <button onClick={resetForm} className="rounded-lg px-4 py-2 text-sm text-text-muted hover:text-text transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSavePath}
                disabled={!formName.trim()}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                {editingPathId ? "Guardar cambios" : "Crear path"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paths grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {paths.length === 0 && !showForm ? (
          <div className="lg:col-span-2 rounded-xl border border-dashed border-border bg-surface p-10 text-center text-text-muted flex flex-col items-center gap-3">
            <GraduationCap className="h-10 w-10 opacity-40" />
            {loading ? (
              <p>Cargando…</p>
            ) : loadError ? (
              <p>No se pudieron cargar los paths.</p>
            ) : (
              <>
                <p>No hay learning paths en tu cuenta todavía.</p>
                <p className="text-sm max-w-md">
                  Para cargar 6 paths de demo con temas, andá a{" "}
                  <Link href="/seed" className="text-primary font-medium hover:underline">
                    Seed → Cargar datos de ejemplo
                  </Link>
                  . No corre solo: hay que ejecutarlo una vez.
                </p>
                <p className="text-xs">O creá tu primer path con el botón de arriba.</p>
              </>
            )}
          </div>
        ) : filteredPaths.length === 0 && (search || activePreset) ? (
          <div className="lg:col-span-2 rounded-xl border border-dashed border-border bg-surface p-8 text-center text-text-muted">
            No se encontraron paths con esos filtros.
          </div>
        ) : (
          filteredPaths.map((path) => {
            const progress = getProgress(path);
            const isExpanded = expandedId === path.id;

            return (
              <div key={path.id} className={`rounded-xl border border-border bg-surface overflow-hidden ${isExpanded ? "lg:col-span-2" : ""}`}>
                {/* Header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-light/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : path.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-text-muted shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-text-muted shrink-0" />
                  )}
                  <span className="text-lg shrink-0">{path.icon || "📚"}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-text flex flex-wrap items-center gap-2">
                      {path.name}
                      {path.visibility === "public" ? (
                        <span className="text-[10px] font-medium rounded-full bg-emerald-500/15 text-emerald-400 px-2 py-0.5">
                          Público
                        </span>
                      ) : null}
                    </span>
                    {(path.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {path.tags.map((t) => (
                          <span key={t} className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-text-muted">
                      {path.topics.filter((t) => t.completed).length}/{path.topics.length}
                    </span>
                    <div className="w-16 h-1.5 rounded-full bg-surface-light overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs font-medium text-primary w-8 text-right">{progress}%</span>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {/* Path actions */}
                    <div className="flex gap-2 px-4 py-2 bg-background/30 border-b border-border">
                      <button
                        onClick={() => startEditPath(path)}
                        className="flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors"
                      >
                        <Pencil className="h-3 w-3" /> Editar
                      </button>
                      <button
                        onClick={() => handleDeletePath(path.id)}
                        className="flex items-center gap-1 text-xs text-text-muted hover:text-red-400 transition-colors ml-auto"
                      >
                        <Trash2 className="h-3 w-3" /> Eliminar path
                      </button>
                    </div>

                    {/* Topics */}
                    <div className="divide-y divide-border">
                      {path.topics.map((topic) => (
                        <div key={topic.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-light/30 transition-colors group">
                          <button onClick={() => handleToggleTopic(path.id, topic.id)} className="shrink-0">
                            {topic.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-400" />
                            ) : (
                              <Circle className="h-5 w-5 text-text-muted hover:text-primary transition-colors" />
                            )}
                          </button>
                          <span className={`flex-1 text-sm ${topic.completed ? "line-through text-text-muted" : "text-text"}`}>
                            {topic.title}
                          </span>
                          {topic.url && (
                            <a
                              href={topic.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="shrink-0 text-primary hover:text-primary/80 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteTopic(path.id, topic.id)}
                            className="shrink-0 opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add topic form */}
                    {showTopicForm === path.id ? (
                      <div className="px-4 py-3 bg-background/30 border-t border-border space-y-2">
                        <input
                          value={topicTitle}
                          onChange={(e) => setTopicTitle(e.target.value)}
                          placeholder="Título del tema (ej: Event Loop, Closures...)"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                          autoFocus
                        />
                        <input
                          value={topicUrl}
                          onChange={(e) => setTopicUrl(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddTopic(path.id)}
                          placeholder="URL del recurso (opcional)"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => { setShowTopicForm(null); setTopicTitle(""); setTopicUrl(""); }}
                            className="rounded-lg px-3 py-1.5 text-xs text-text-muted hover:text-text transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleAddTopic(path.id)}
                            disabled={!topicTitle.trim()}
                            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-40"
                          >
                            Agregar tema
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setShowTopicForm(path.id); setTopicTitle(""); setTopicUrl(""); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-text-muted hover:text-primary hover:bg-surface-light/30 transition-colors border-t border-border"
                      >
                        <Plus className="h-3.5 w-3.5" /> Agregar tema
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
