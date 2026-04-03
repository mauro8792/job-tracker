"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Rocket, ArrowLeft, Briefcase, PartyPopper, Target, Trophy } from "lucide-react";
import { apiStore } from "@/lib/api-store";
import type { PublicProfile } from "@/lib/types";

export default function PublicProfilePage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [data, setData] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setErr("Enlace inválido");
      return;
    }
    setLoading(true);
    setErr(null);
    apiStore
      .getPublicProfile(slug)
      .then(setData)
      .catch((e) => {
        setErr(e instanceof Error ? e.message : "Perfil no encontrado");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const name = data ? `${data.firstName} ${data.lastName}`.trim() : "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-surface px-4 py-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            DevJobTracker
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            <Rocket className="h-4 w-4" />
            Entrar
          </Link>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-10">
        {loading ? (
          <p className="text-center text-text-muted text-sm">Cargando perfil…</p>
        ) : err ? (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <p className="text-text-muted">{err}</p>
            <Link href="/" className="inline-block mt-4 text-primary hover:underline text-sm">
              Volver al inicio
            </Link>
          </div>
        ) : data ? (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {data.avatar ? (
                <img
                  src={data.avatar}
                  alt=""
                  className="h-24 w-24 rounded-full border-2 border-border shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 text-3xl font-bold text-primary shrink-0">
                  {data.firstName?.[0]}
                  {data.lastName?.[0]}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-text">{name}</h1>
                {data.bio ? (
                  <p className="mt-2 text-text-muted text-sm leading-relaxed whitespace-pre-wrap">
                    {data.bio}
                  </p>
                ) : (
                  <p className="mt-2 text-text-muted text-sm italic">
                    Búsqueda activa en DevJobTracker
                  </p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">
                Progreso en la búsqueda
              </h2>
              <p className="text-xs text-text-muted mb-4">
                Totales desde tu tablero de aplicaciones (sin mostrar empresas ni roles).
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  icon={Briefcase}
                  label="Aplicaciones"
                  value={data.stats.applicationsTotal}
                />
                <StatCard icon={Target} label="En entrevista" value={data.stats.interviewsStageCount} />
                <StatCard icon={PartyPopper} label="Ofertas" value={data.stats.offersCount} />
                <StatCard
                  icon={Trophy}
                  label="Contrataciones"
                  value={data.stats.hiredCount}
                  highlight
                />
              </div>
            </div>

            <p className="text-center text-xs text-text-muted pt-4">
              Perfil público de{" "}
              <span className="text-text">{name}</span> · DevJobTracker
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 text-center ${
        highlight ? "border-primary/40 bg-primary/5" : "border-border bg-surface"
      }`}
    >
      <Icon className={`h-5 w-5 mx-auto mb-2 ${highlight ? "text-primary" : "text-text-muted"}`} />
      <p className="text-2xl font-bold text-text tabular-nums">{value}</p>
      <p className="text-[11px] text-text-muted mt-1">{label}</p>
    </div>
  );
}
