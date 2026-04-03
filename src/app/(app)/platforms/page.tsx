"use client";

import { useEffect, useState } from "react";
import { apiStore } from "@/lib/api-store";
import { Platform } from "@/lib/types";
import { ExternalLink, Check, Clock, Circle } from "lucide-react";

const STATUS_OPTIONS: { value: Platform["status"]; label: string; icon: typeof Check; color: string }[] = [
  { value: "complete", label: "Completo", icon: Check, color: "text-emerald-400 bg-emerald-500/15" },
  { value: "pending", label: "Pendiente", icon: Clock, color: "text-amber-400 bg-amber-500/15" },
  { value: "not_started", label: "Sin empezar", icon: Circle, color: "text-zinc-400 bg-zinc-500/15" },
];

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  useEffect(() => {
    apiStore.getPlatforms().then(setPlatforms).catch(() => {});
  }, []);

  const handleStatusChange = async (id: string, status: Platform["status"]) => {
    await apiStore.updatePlatform(id, { status });
    const data = await apiStore.getPlatforms();
    setPlatforms(data);
  };

  const handleToggle = async (id: string, field: "hasProfile" | "hasAlerts") => {
    const platform = platforms.find((p) => p.id === id);
    if (!platform) return;
    await apiStore.updatePlatform(id, { [field]: !platform[field] });
    const data = await apiStore.getPlatforms();
    setPlatforms(data);
  };

  const completeCount = platforms.filter((p) => p.status === "complete").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plataformas</h1>
        <p className="text-text-muted mt-1">
          {completeCount} de {platforms.length} plataformas configuradas
        </p>
      </div>

      <div className="w-full bg-surface-light rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full transition-all"
          style={{ width: `${(completeCount / platforms.length) * 100}%` }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((p) => {
          const statusInfo = STATUS_OPTIONS.find((s) => s.value === p.status)!;
          return (
            <div key={p.id} className="rounded-xl border border-border bg-surface p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                  >
                    {p.url.replace("https://", "")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusInfo.color}`}>
                  <statusInfo.icon className="h-3 w-3" />
                  {statusInfo.label}
                </span>
              </div>

              <div className="flex gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(p.id, opt.value)}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                      p.status === opt.value
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-text-muted hover:border-primary/30"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={p.hasProfile}
                    onChange={() => handleToggle(p.id, "hasProfile")}
                    className="rounded border-border accent-primary"
                  />
                  <span className="text-text-muted">Perfil creado</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={p.hasAlerts}
                    onChange={() => handleToggle(p.id, "hasAlerts")}
                    className="rounded border-border accent-primary"
                  />
                  <span className="text-text-muted">Alertas</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
