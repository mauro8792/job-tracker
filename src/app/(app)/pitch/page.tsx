"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Sparkles, ArrowRight, ArrowLeft, Save, Languages } from "lucide-react";
import {
  type PitchData,
  INITIAL_PITCH_DATA,
  type PitchLang,
  generatePitches,
  buildGeneratedPitchesByLang,
} from "@/lib/pitch-templates";
import { AppSectionIntro } from "@/components/SectionIntroModal";

const STEPS = [
  {
    title: "Lo básico",
    subtitle: "Empecemos con tu info principal",
    fields: [
      { key: "name", label: "Tu nombre", placeholder: "Nombre y apellido" },
      { key: "currentRole", label: "Tu rol actual", placeholder: "Ej.: Senior Software Engineer" },
      { key: "yearsExperience", label: "Años de experiencia", placeholder: "Ej.: 5" },
      { key: "currentCompany", label: "Empresa actual o última", placeholder: "Nombre del empleador actual o más reciente" },
    ],
  },
  {
    title: "Tus skills",
    subtitle: "¿Con qué tecnologías trabajás?",
    fields: [
      {
        key: "mainTechnologies",
        label: "Tecnologías principales",
        placeholder: "Ej.: tecnologías separadas por comas",
      },
    ],
  },
  {
    title: "Tus logros",
    subtitle: "Lo que te hace destacar. Pensá en resultados concretos.",
    fields: [
      {
        key: "keyAchievement1",
        label: "Logro principal (qué hiciste y qué impacto tuvo)",
        placeholder:
          "Ej.: lideré el rediseño de la API principal y bajamos el tiempo de respuesta un 30%",
      },
      {
        key: "keyAchievement2",
        label: "Segundo logro (otro ejemplo concreto)",
        placeholder:
          "Ej.: automatizamos despliegues y pasamos de releases semanales a diarios",
      },
    ],
  },
  {
    title: "Tu diferencial",
    subtitle: "Lo que Yari llama 'venderte' - ¿qué te hace único?",
    fields: [
      {
        key: "uniqueStrength",
        label: "Tu fortaleza única (¿qué te diferencia de otros devs?)",
        placeholder: "Ej.: me encargo del problema de punta a punta, de diseño a producción",
      },
      {
        key: "softSkill",
        label: "Soft skill que te define",
        placeholder: "Ej.: comunicación clara en equipos remotos y documentación útil",
      },
    ],
  },
  {
    title: "¿Qué buscás?",
    subtitle: "Cerrá con claridad sobre lo que querés",
    fields: [
      {
        key: "lookingFor",
        label: "¿Qué tipo de oportunidad buscás?",
        placeholder:
          "Ej.: rol remoto backend o full-stack en producto, con problemas técnicos desafiantes",
      },
      {
        key: "whyRemote",
        label: "¿Por qué remoto? (motivación)",
        placeholder:
          "Ej.: prefiero equipos distribuidos y trabajo asíncrono para concentrarme mejor",
      },
    ],
  },
];

function isPitchLang(v: unknown): v is PitchLang {
  return v === "es" || v === "en";
}

export default function PitchBuilderPage() {
  const [data, setData] = useState<PitchData>(INITIAL_PITCH_DATA);
  const [lang, setLang] = useState<PitchLang>("es");
  const [step, setStep] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    import("@/lib/api-store").then(({ apiStore }) => {
      apiStore
        .getPitch()
        .then((d: PitchData & { preferredLanguage?: string }) => {
          const merged = { ...INITIAL_PITCH_DATA };
          for (const key of Object.keys(merged) as (keyof PitchData)[]) {
            const v = d[key];
            if (typeof v === "string" && v) merged[key] = v;
          }
          setData(merged);
          if (isPitchLang(d.preferredLanguage)) setLang(d.preferredLanguage);
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
    });
  }, []);

  const persistPayload = (form: PitchData, language: PitchLang) => ({
    ...form,
    preferredLanguage: language,
    generatedPitchesByLang: buildGeneratedPitchesByLang(form),
  });

  const save = async (language?: PitchLang) => {
    const l = language ?? lang;
    const { apiStore } = await import("@/lib/api-store");
    await apiStore.savePitch(persistPayload(data, l));
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleLangChange = async (next: PitchLang) => {
    setLang(next);
    const { apiStore } = await import("@/lib/api-store");
    await apiStore.savePitch(persistPayload(data, next));
  };

  const handleChange = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const allComplete = Object.values(data).every((v) => v.trim() !== "");

  const pitches = generatePitches(data, lang);
  const hasGenerated = loaded && allComplete && !editing;

  if (hasGenerated) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tu presentación, lista para usar</h1>
            <p className="text-text-muted mt-1">
              Copiá, ajustá y practicá en voz alta. Los textos (ES y EN) quedan guardados en tu cuenta al usar
              Guardar.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-surface-light">
              <button
                type="button"
                onClick={() => void handleLangChange("es")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  lang === "es" ? "bg-primary text-white" : "text-text-muted hover:text-text"
                }`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => void handleLangChange("en")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  lang === "en" ? "bg-primary text-white" : "text-text-muted hover:text-text"
                }`}
              >
                EN
              </button>
            </div>
            <button
              onClick={() => {
                setEditing(true);
                setStep(0);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text hover:border-primary/30 transition-colors"
            >
              <Sparkles className="h-4 w-4" /> Editar datos
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm text-text-muted flex items-start gap-2">
            <Languages className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>
              <strong>Tip:</strong> El contenido se arma con tus respuestas y plantillas fijas. Si más adelante
              sumamos IA, el texto refinado también se podrá guardar igual en el servidor.
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-text-muted">
            <Sparkles className="h-4 w-4 text-primary inline mr-1.5" />
            <strong>Tip de Yari:</strong> No memorices palabra por palabra. Interiorizá la estructura y practicá
            contándolo natural, como si hablaras con un amigo. La clave es sonar genuino, no robótico.
          </p>
        </div>

        <div className="space-y-4">
          {pitches.map((pitch) => (
            <div key={pitch.id} className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">{pitch.title}</h3>
                <p className="text-sm text-text-muted mt-0.5">{pitch.description}</p>
              </div>
              <div className="p-4">
                <pre className="whitespace-pre-wrap text-sm text-text leading-relaxed font-sans">
                  {pitch.content}
                </pre>
              </div>
              <div className="flex justify-end border-t border-border p-3">
                <button
                  onClick={() => handleCopy(pitch.content, pitch.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted hover:text-text hover:border-primary/30"
                >
                  {copiedId === pitch.id ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copiar
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="font-semibold mb-2">Cómo practicar tu presentación</h3>
          <ol className="space-y-2 text-sm text-text-muted list-decimal list-inside">
            <li>Leé el texto en voz alta varias veces hasta que suene natural</li>
            <li>Grabate con el celular y escuchate (sí, da cringe, pero funciona)</li>
            <li>Practicá con un amigo o en Pramp con otro dev</li>
            <li>Adaptá según la empresa: cambiá el &quot;looking for&quot; según el puesto</li>
            <li>Cronometrá: el de 30 seg debería durar ~30 seg, el de 60 seg ~1 min</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <AppSectionIntro sectionId="pitch" />
      <div className="text-center">
        <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
        <h1 className="text-2xl font-bold">Tu presentación personal</h1>
        <p className="text-text-muted mt-1">
          En 5 pasos armás lo que contarías en una entrevista o un café con un recruiter: con tus datos generamos
          textos listos (español e inglés) para copiar y practicar.
        </p>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex-1">
            <button
              type="button"
              onClick={() => setStep(i)}
              className={`w-full h-1.5 rounded-full transition-colors ${
                i < step ? "bg-emerald-500" : i === step ? "bg-primary" : "bg-surface-light"
              }`}
            />
            <p
              className={`text-[10px] mt-1 text-center ${i === step ? "text-primary" : "text-text-muted"}`}
            >
              {s.title}
            </p>
          </div>
        ))}
      </div>

      {/* Current step */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold">{STEPS[step].title}</h2>
        <p className="text-sm text-text-muted mb-5">{STEPS[step].subtitle}</p>

        <div className="space-y-4">
          {STEPS[step].fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm text-text-muted mb-1.5">{field.label}</label>
              {field.placeholder.length > 80 ? (
                <textarea
                  value={data[field.key as keyof PitchData]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-surface-light px-4 py-2.5 text-sm text-text leading-relaxed focus:border-primary focus:outline-none resize-none"
                />
              ) : (
                <input
                  value={data[field.key as keyof PitchData]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-border bg-surface-light px-4 py-2.5 text-sm text-text focus:border-primary focus:outline-none"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" /> Anterior
        </button>

        <button
          type="button"
          onClick={() => void save()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:text-text hover:border-primary/30"
        >
          {savedMsg ? <Check className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
          {savedMsg ? "Guardado!" : "Guardar"}
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Siguiente <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              void save().then(() => setEditing(false));
            }}
            disabled={!allComplete}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="h-4 w-4" /> {allComplete ? "Ver mis textos" : "Generar mis textos"}
          </button>
        )}
      </div>
    </div>
  );
}
