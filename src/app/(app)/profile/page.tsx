"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiStore } from "@/lib/api-store";
import {
  User,
  Crown,
  Calendar,
  Mail,
  Shield,
  Clock,
  Sparkles,
  Globe,
  Loader2,
  ExternalLink,
  CalendarClock,
} from "lucide-react";

const PLAN_CONFIG: Record<string, { label: string; color: string; icon: typeof Crown; description: string }> = {
  trial: {
    label: "Trial",
    color: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    icon: Clock,
    description: "Estás en el período de prueba. Disfrutá de todas las features Pro.",
  },
  free: {
    label: "Free",
    color: "text-text-muted bg-surface-light border-border",
    icon: User,
    description: "Plan gratuito con features básicas.",
  },
  pro: {
    label: "Pro",
    color: "text-primary bg-primary/10 border-primary/30",
    icon: Crown,
    description: "Acceso completo a todas las features.",
  },
};

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [pubEnabled, setPubEnabled] = useState(false);
  const [pubSlug, setPubSlug] = useState("");
  const [pubBio, setPubBio] = useState("");
  const [pubSaving, setPubSaving] = useState(false);
  const [pubMsg, setPubMsg] = useState<string | null>(null);
  const [calendarMsg, setCalendarMsg] = useState<string | null>(null);
  const [calendarBusy, setCalendarBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setPubEnabled(user.publicProfileEnabled ?? false);
    setPubSlug(user.publicSlug ?? "");
    setPubBio(user.publicBio ?? "");
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("calendar_connected") === "1") {
      void refreshProfile();
      setCalendarMsg("Google Calendar conectado. Ya podés agregar entrevistas desde cada aplicación.");
      window.history.replaceState({}, "", "/profile");
    }
    const cerr = params.get("calendar_error");
    if (cerr) {
      setCalendarMsg(decodeURIComponent(cerr));
      window.history.replaceState({}, "", "/profile");
    }
  }, [refreshProfile]);

  if (!user) return null;

  const savePublicProfile = async () => {
    setPubSaving(true);
    setPubMsg(null);
    try {
      await apiStore.updateMe({
        publicProfileEnabled: pubEnabled,
        publicSlug: pubSlug.trim() || null,
        publicBio: pubBio.trim(),
      });
      await refreshProfile();
      setPubMsg("Cambios guardados.");
    } catch (e) {
      setPubMsg(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setPubSaving(false);
    }
  };

  const connectGoogleCalendar = async () => {
    setCalendarMsg(null);
    try {
      const { url } = await apiStore.getCalendarConnectUrl();
      window.location.href = url;
    } catch (e) {
      setCalendarMsg(e instanceof Error ? e.message : "No se pudo iniciar la conexión");
    }
  };

  const disconnectGoogleCalendar = async () => {
    setCalendarBusy(true);
    setCalendarMsg(null);
    try {
      await apiStore.disconnectCalendar();
      await refreshProfile();
      setCalendarMsg("Google Calendar desconectado.");
    } catch (e) {
      setCalendarMsg(e instanceof Error ? e.message : "Error al desconectar");
    } finally {
      setCalendarBusy(false);
    }
  };

  const plan = PLAN_CONFIG[user.plan] ?? PLAN_CONFIG.free;
  const PlanIcon = plan.icon;

  const trialDaysLeft = user.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi perfil</h1>
        <p className="text-text-muted text-sm mt-1">Tu información personal y estado de tu cuenta</p>
      </div>

      {/* Profile card */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-start gap-5">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.firstName}
              className="h-20 w-20 rounded-full border-2 border-border"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
            <div className="flex items-center gap-2 mt-1 text-text-muted">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="text-sm truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-text-muted">
              <Shield className="h-4 w-4 shrink-0" />
              <span className="text-sm">Cuenta Google vinculada</span>
            </div>
          </div>
        </div>
      </div>

      {/* Perfil público */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Perfil público</h3>
        </div>
        <p className="text-sm text-text-muted">
          Mostrá una página con tu nombre, foto de Google y métricas agregadas de tu tablero (aplicaciones,
          entrevistas, ofertas y contrataciones). No se muestran empresas ni roles.
        </p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-border"
            checked={pubEnabled}
            onChange={(e) => setPubEnabled(e.target.checked)}
          />
          <span className="text-sm">Activar perfil público</span>
        </label>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">URL (slug)</label>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-text-muted shrink-0">…/u/</span>
            <input
              type="text"
              value={pubSlug}
              onChange={(e) => setPubSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="tu-nombre"
              className="flex-1 min-w-[8rem] rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <p className="text-[11px] text-text-muted mt-1">
            Solo minúsculas, números y guiones. Entre 3 y 32 caracteres.
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Bio (opcional)</label>
          <textarea
            rows={3}
            value={pubBio}
            onChange={(e) => setPubBio(e.target.value)}
            maxLength={500}
            placeholder="Stack, objetivo de búsqueda, link a portfolio…"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-y"
          />
        </div>
        {pubMsg ? (
          <p className={`text-sm ${pubMsg.startsWith("Cambios") ? "text-emerald-400" : "text-red-300"}`}>
            {pubMsg}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={savePublicProfile}
            disabled={pubSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {pubSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Guardar perfil público
          </button>
          {user.publicProfileEnabled && user.publicSlug ? (
            <Link
              href={`/u/${user.publicSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              Ver página pública
              <ExternalLink className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>

      {/* Google Calendar */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Google Calendar</h3>
        </div>
        <p className="text-sm text-text-muted">
          Conectá tu cuenta para crear eventos en tu calendario principal desde cada entrevista del Kanban
          (título con empresa y rol, fecha, hora y notas).
        </p>
        {calendarMsg ? (
          <p
            className={`text-sm ${
              calendarMsg.includes("conectado") && !calendarMsg.includes("des")
                ? "text-emerald-400"
                : calendarMsg.includes("desconectado")
                  ? "text-text-muted"
                  : "text-amber-300"
            }`}
          >
            {calendarMsg}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          {user.calendarConnected ? (
            <>
              <span className="text-sm text-emerald-400">Conectado</span>
              <button
                type="button"
                disabled={calendarBusy}
                onClick={disconnectGoogleCalendar}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text disabled:opacity-50"
              >
                {calendarBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Desconectar
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={connectGoogleCalendar}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Conectar Google Calendar
            </button>
          )}
        </div>
        <p className="text-[11px] text-text-muted">
          En Google Cloud Console agregá la URI de redirección OAuth:{" "}
          <code className="text-primary/90 break-all">
            {typeof window !== "undefined"
              ? `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"}/calendar/connect/google/callback`
              : "…/api/calendar/connect/google/callback"}
          </code>
        </p>
      </div>

      {/* Plan card */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Plan actual</h3>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${plan.color}`}>
            <PlanIcon className="h-4 w-4" />
            {plan.label}
          </span>
        </div>

        <p className="text-sm text-text-muted">{plan.description}</p>

        {user.plan === "trial" && trialDaysLeft > 0 && (
          <div className="rounded-lg bg-amber-400/5 border border-amber-400/20 p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-400">
                  Te quedan {trialDaysLeft} día{trialDaysLeft !== 1 ? "s" : ""} de prueba
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  Tu trial vence el {new Date(user.trialEndsAt!).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>
        )}

        {user.plan === "trial" && trialDaysLeft === 0 && (
          <div className="rounded-lg bg-red-400/5 border border-red-400/20 p-4">
            <p className="text-sm font-medium text-red-400">Tu período de prueba expiró</p>
            <p className="text-xs text-text-muted mt-0.5">Pasá a Pro para seguir usando todas las features.</p>
          </div>
        )}

        {user.plan !== "pro" && (
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-lg bg-primary/20 px-4 py-2.5 text-sm font-medium text-primary cursor-not-allowed opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade a Pro — Próximamente
          </button>
        )}
      </div>

      {/* Features by plan */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
        <h3 className="text-lg font-semibold">Comparación de planes</h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="font-medium text-text-muted">Feature</div>
          <div className="text-center font-medium text-text-muted">Free</div>
          <div className="text-center font-medium text-primary">Pro</div>

          {[
            { name: "Dashboard + Kanban", free: true, pro: true },
            { name: "Checklist diaria", free: true, pro: true },
            { name: "Hasta 10 aplicaciones", free: true, pro: false },
            { name: "Aplicaciones ilimitadas", free: false, pro: true },
            { name: "Analytics avanzados", free: false, pro: true },
            { name: "Pitch Builder", free: false, pro: true },
            { name: "Learning Paths", free: false, pro: true },
            { name: "Banco de preguntas", free: false, pro: true },
            { name: "Comunidad (próximamente)", free: false, pro: true },
          ].map((row) => (
            <div key={row.name} className="contents">
              <div className="py-2 border-t border-border/50">{row.name}</div>
              <div className="py-2 border-t border-border/50 text-center">{row.free ? "✓" : "—"}</div>
              <div className="py-2 border-t border-border/50 text-center">{row.pro ? "✓" : "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Account info */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
        <h3 className="text-lg font-semibold">Información de la cuenta</h3>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-surface-light p-3">
            <p className="text-text-muted text-xs">ID de usuario</p>
            <p className="font-mono text-xs mt-1 truncate">{user.id}</p>
          </div>
          <div className="rounded-lg bg-surface-light p-3">
            <p className="text-text-muted text-xs">Proveedor de autenticación</p>
            <p className="mt-1">Google</p>
          </div>
        </div>
      </div>
    </div>
  );
}
