"use client";

import { useEffect, useState } from "react";
import { apiStore } from "@/lib/api-store";
import { ChecklistItem } from "@/lib/types";
import {
  CheckCircle2,
  Circle,
  Brain,
  Globe2,
  Briefcase,
  Star,
  Trash2,
  Pencil,
  Check,
  X,
  Plus,
} from "lucide-react";

const CATEGORY_META: Record<string, { label: string; icon: typeof Brain; color: string }> = {
  algorithms: { label: "Algoritmos", icon: Brain, color: "text-purple-400" },
  english: { label: "Inglés", icon: Globe2, color: "text-blue-400" },
  applications: { label: "Aplicaciones", icon: Briefcase, color: "text-emerald-400" },
  other: { label: "Otro", icon: Star, color: "text-amber-400" },
};

const CATEGORIES = [
  { value: "algorithms", label: "Algoritmos" },
  { value: "english", label: "Inglés" },
  { value: "applications", label: "Aplicaciones" },
  { value: "other", label: "Otro" },
];

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newCategory, setNewCategory] = useState<ChecklistItem["category"]>("other");

  useEffect(() => {
    apiStore.getTodayChecklist().then(setItems).catch(() => {});
  }, []);

  const refresh = async () => {
    const data = await apiStore.getTodayChecklist();
    setItems(data);
  };

  const toggle = async (id: string) => {
    await apiStore.toggleChecklistItem(id);
    refresh();
  };

  const startEdit = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditText(item.label);
  };

  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    await apiStore.updateChecklistItem(editingId, editText.trim());
    setEditingId(null);
    setEditText("");
    refresh();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleDelete = async (id: string) => {
    await apiStore.deleteChecklistItem(id);
    refresh();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    await apiStore.addChecklistItem(newLabel.trim(), newCategory);
    setNewLabel("");
    setNewCategory("other");
    setShowAdd(false);
    refresh();
  };

  const completed = items.filter((i) => i.completed).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const today = new Date();
  const dateStr = today.toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Checklist diaria</h1>
          <p className="text-text-muted mt-1 capitalize">{dateStr}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> Agregar
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-text-muted">Progreso de hoy</span>
          <span className="text-sm font-semibold">{completed}/{total}</span>
        </div>
        <div className="w-full bg-surface-light rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct === 100 && (
          <p className="text-emerald-400 text-sm mt-3 font-medium">
            Completaste todo por hoy!
          </p>
        )}
      </div>

      {showAdd && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-sm text-text-muted mb-1">Tarea</label>
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Ej: 60 min de inglés, Resolver 3 problemas de LeetCode..."
                autoFocus
                className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Categoría</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setNewCategory(cat.value as ChecklistItem["category"])}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      newCategory === cat.value
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-text-muted hover:border-primary/30"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted hover:text-text">
                Cancelar
              </button>
              <button type="submit" className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover">
                Agregar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {items.map((item) => {
          const meta = CATEGORY_META[item.category] || CATEGORY_META.other;
          const isEditing = editingId === item.id;

          return (
            <div
              key={item.id}
              className={`w-full flex items-center gap-4 rounded-xl border p-4 transition-colors group ${
                item.completed
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-border bg-surface hover:border-primary/30"
              }`}
            >
              <button onClick={() => toggle(item.id)} className="shrink-0">
                {item.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                ) : (
                  <Circle className="h-6 w-6 text-zinc-600" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit(); }}
                      autoFocus
                      className="flex-1 rounded-lg border border-primary bg-surface-light px-2 py-1 text-sm text-text focus:outline-none"
                    />
                    <button onClick={saveEdit} className="text-emerald-400 hover:text-emerald-300 p-1">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={cancelEdit} className="text-text-muted hover:text-text p-1">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className={`text-sm font-medium ${item.completed ? "line-through text-text-muted" : "text-text"}`}>
                      {item.label}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <meta.icon className={`h-3 w-3 ${meta.color}`} />
                      <span className={`text-xs ${meta.color}`}>{meta.label}</span>
                    </div>
                  </>
                )}
              </div>

              {!isEditing && (
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(item)} className="text-text-muted hover:text-primary p-1">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-text-muted hover:text-red-400 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-text-muted">No hay items en el checklist</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" /> Agregar tarea
          </button>
        </div>
      )}
    </div>
  );
}
