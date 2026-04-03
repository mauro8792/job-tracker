"use client";

import { useState } from "react";
import { apiStore } from "@/lib/api-store";
import { useRouter } from "next/navigation";
import { Database, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

export default function SeedPage() {
  const [seeded, setSeeded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState({ questions: 0, paths: 0 });
  const router = useRouter();

  const handleSeed = async () => {
    setError(null);
    setLoading(true);
    try {
      const r = await apiStore.seedDemoData();
      setResult(r);
      setSeeded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar los datos de ejemplo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="rounded-2xl border border-border bg-surface p-8 max-w-md text-center space-y-4">
        <Database className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-xl font-bold text-text">Cargar datos de ejemplo</h1>
        <p className="text-sm text-text-muted">
          Guarda en tu cuenta (API) 18 preguntas de entrevista y 6 learning paths con temas de ejemplo.
          Solo se agregan preguntas y rutas que todavía no tengas (mismo texto o mismo nombre de ruta).
        </p>

        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        {seeded ? (
          <div className="space-y-3">
            <div className="flex flex-col items-center gap-1 text-emerald-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Datos cargados</span>
              </div>
              <p className="text-xs text-text-muted">
                +{result.questions} preguntas, +{result.paths} learning paths agregados
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => router.push("/questions")}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                Ver Preguntas <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => router.push("/learning")}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text hover:border-primary/30"
              >
                Ver Learning Path <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSeed}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando…
              </>
            ) : (
              "Cargar datos de ejemplo"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
