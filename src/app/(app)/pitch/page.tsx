"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Sparkles, ArrowRight, ArrowLeft, Save } from "lucide-react";

interface PitchData {
  name: string;
  currentRole: string;
  yearsExperience: string;
  currentCompany: string;
  mainTechnologies: string;
  keyAchievement1: string;
  keyAchievement2: string;
  softSkill: string;
  lookingFor: string;
  whyRemote: string;
  uniqueStrength: string;
}

const INITIAL_DATA: PitchData = {
  name: "",
  currentRole: "",
  yearsExperience: "",
  currentCompany: "",
  mainTechnologies: "",
  keyAchievement1: "",
  keyAchievement2: "",
  softSkill: "",
  lookingFor: "",
  whyRemote: "",
  uniqueStrength: "",
};

function generatePitches(d: PitchData) {
  const elevator30s = `Hi, I'm ${d.name}. I'm a ${d.currentRole} with ${d.yearsExperience} years of experience specializing in ${d.mainTechnologies}. At ${d.currentCompany}, ${d.keyAchievement1}. I'm looking for ${d.lookingFor} where I can leverage my experience to make a real impact.`;

  const elevator60s = `Hi, I'm ${d.name}. I'm a ${d.currentRole} with ${d.yearsExperience} years of experience building production-grade systems with ${d.mainTechnologies}.

At ${d.currentCompany}, ${d.keyAchievement1}. I also ${d.keyAchievement2}.

What sets me apart is ${d.uniqueStrength}. I'm also ${d.softSkill}.

I'm currently looking for ${d.lookingFor}. ${d.whyRemote} I'm excited about opportunities where I can tackle challenging technical problems and continue growing.`;

  const tellMeAboutYourself = `I'm a ${d.currentRole} with ${d.yearsExperience} years of hands-on experience. I specialize in ${d.mainTechnologies}.

Currently at ${d.currentCompany}, where ${d.keyAchievement1}. One of my proudest achievements was when ${d.keyAchievement2}.

I'd describe myself as ${d.softSkill}, and what I bring to any team is ${d.uniqueStrength}.

I'm looking for ${d.lookingFor} because ${d.whyRemote}. I'm ready for the next challenge where I can have a bigger impact on the product.`;

  const whyHireMe = `You should hire me because I bring ${d.yearsExperience} years of real-world experience in ${d.mainTechnologies}, not just theoretical knowledge.

At ${d.currentCompany}, I've proven I can deliver: ${d.keyAchievement1}. I also ${d.keyAchievement2}.

Beyond technical skills, ${d.uniqueStrength}. I'm ${d.softSkill}, which means I can integrate quickly into your team and start contributing from day one.

I'm specifically looking for ${d.lookingFor}, and I believe this role aligns perfectly with where I want to grow.`;

  const linkedinSummary = `${d.currentRole} with ${d.yearsExperience}+ years of experience in ${d.mainTechnologies}. ${d.keyAchievement1} at ${d.currentCompany}. ${d.uniqueStrength}. ${d.softSkill}. Open to ${d.lookingFor}.`;

  return [
    { id: "elevator30", title: "Elevator Pitch (30 seg)", description: "Para cuando te preguntan '¿a qué te dedicás?' en un networking o al inicio de una call.", content: elevator30s },
    { id: "elevator60", title: "Elevator Pitch (60 seg)", description: "Versión completa para cuando tenés más tiempo. Ideal para inicios de entrevista.", content: elevator60s },
    { id: "tellme", title: "Tell me about yourself", description: "La pregunta más importante de cualquier entrevista. Usá esta estructura SIEMPRE.", content: tellMeAboutYourself },
    { id: "whyhire", title: "Why should we hire you?", description: "Tu cierre de venta. Mostrá confianza y conectá tu experiencia con lo que buscan.", content: whyHireMe },
    { id: "linkedin", title: "LinkedIn Summary", description: "Versión compacta para tu sección 'About' de LinkedIn.", content: linkedinSummary },
  ];
}

const STEPS = [
  {
    title: "Lo básico",
    subtitle: "Empecemos con tu info principal",
    fields: [
      { key: "name", label: "Tu nombre", placeholder: "Mauro Yini" },
      { key: "currentRole", label: "Tu rol actual", placeholder: "Sr Backend Engineer" },
      { key: "yearsExperience", label: "Años de experiencia", placeholder: "5" },
      { key: "currentCompany", label: "Empresa actual o última", placeholder: "GlobalLogic" },
    ],
  },
  {
    title: "Tus armas",
    subtitle: "¿Con qué tecnologías trabajás?",
    fields: [
      { key: "mainTechnologies", label: "Tecnologías principales", placeholder: "Node.js, NestJS, TypeScript, MongoDB, Docker" },
    ],
  },
  {
    title: "Tus logros",
    subtitle: "Lo que te hace destacar. Pensá en resultados concretos.",
    fields: [
      { key: "keyAchievement1", label: "Logro principal (qué hiciste y qué impacto tuvo)", placeholder: "I designed and built REST APIs serving 10K+ daily users for a property management system" },
      { key: "keyAchievement2", label: "Segundo logro (otro ejemplo concreto)", placeholder: "built a real-time dashboard with Socket.IO and Redis that improved system availability by 40%" },
    ],
  },
  {
    title: "Tu diferencial",
    subtitle: "Lo que Yari llama 'venderte' - ¿qué te hace único?",
    fields: [
      { key: "uniqueStrength", label: "Tu fortaleza única (¿qué te diferencia de otros devs?)", placeholder: "my ability to take ownership of problems end-to-end, from architecture to deployment" },
      { key: "softSkill", label: "Soft skill que te define", placeholder: "a strong communicator who thrives in collaborative, remote teams" },
    ],
  },
  {
    title: "¿Qué buscás?",
    subtitle: "Cerrá con claridad sobre lo que querés",
    fields: [
      { key: "lookingFor", label: "¿Qué tipo de oportunidad buscás?", placeholder: "a remote backend or full-stack position at a product company where I can tackle complex problems" },
      { key: "whyRemote", label: "¿Por qué remoto? (motivación)", placeholder: "I've worked in distributed teams for years and I'm most productive in async-first environments." },
    ],
  },
];

export default function PitchBuilderPage() {
  const [data, setData] = useState<PitchData>(INITIAL_DATA);
  const [step, setStep] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    import("@/lib/api-store").then(({ apiStore }) => {
      apiStore.getPitch().then((d: PitchData) => {
        const merged = { ...INITIAL_DATA };
        for (const key of Object.keys(merged) as (keyof PitchData)[]) {
          if (d[key]) merged[key] = d[key];
        }
        setData(merged);
        setLoaded(true);
      }).catch(() => setLoaded(true));
    });
  }, []);

  const save = async () => {
    const { apiStore } = await import("@/lib/api-store");
    await apiStore.savePitch(data);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleChange = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isStepComplete = STEPS[step]?.fields.every(
    (f) => data[f.key as keyof PitchData].trim() !== ""
  );

  const allComplete = Object.values(data).every((v) => v.trim() !== "");

  const pitches = generatePitches(data);
  const hasGenerated = loaded && allComplete && !editing;

  if (hasGenerated) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tus speeches listos</h1>
            <p className="text-text-muted mt-1">Copiá, personalizá y practicá frente al espejo</p>
          </div>
          <button
            onClick={() => { setEditing(true); setStep(0); }}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text hover:border-primary/30 transition-colors"
          >
            <Sparkles className="h-4 w-4" /> Editar datos
          </button>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm text-text-muted">
            <Sparkles className="h-4 w-4 text-primary inline mr-1.5" />
            <strong>Tip de Yari:</strong> No memorices palabra por palabra. Interiorizá la estructura y practicá contándolo natural, como si hablaras con un amigo. La clave es sonar genuino, no robótico.
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
                    <><Check className="h-4 w-4 text-emerald-400" /> Copiado!</>
                  ) : (
                    <><Copy className="h-4 w-4" /> Copiar</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="font-semibold mb-2">Cómo practicar tu pitch</h3>
          <ol className="space-y-2 text-sm text-text-muted list-decimal list-inside">
            <li>Leé el pitch en voz alta 3 veces hasta que fluya natural</li>
            <li>Grabate con el celular y escuchate (sí, da cringe, pero funciona)</li>
            <li>Practicá con un amigo o en Pramp con otro dev</li>
            <li>Adaptá según la empresa: cambiá el "looking for" según el puesto</li>
            <li>Cronometrá: el de 30 seg debería durar ~30 seg, el de 60 seg ~1 min</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
        <h1 className="text-2xl font-bold">Pitch Builder</h1>
        <p className="text-text-muted mt-1">
          Armá tu speech de venta en 5 pasos. Completá tu info y te genero los textos listos para usar.
        </p>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex-1">
            <button
              onClick={() => setStep(i)}
              className={`w-full h-1.5 rounded-full transition-colors ${
                i < step ? "bg-emerald-500" : i === step ? "bg-primary" : "bg-surface-light"
              }`}
            />
            <p className={`text-[10px] mt-1 text-center ${i === step ? "text-primary" : "text-text-muted"}`}>
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
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" /> Anterior
        </button>

        <button
          onClick={save}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:text-text hover:border-primary/30"
        >
          {savedMsg ? <Check className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
          {savedMsg ? "Guardado!" : "Guardar"}
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Siguiente <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => { save(); setEditing(false); }}
            disabled={!allComplete}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="h-4 w-4" /> {allComplete ? "Ver mis speeches" : "Generar mis speeches"}
          </button>
        )}
      </div>
    </div>
  );
}
