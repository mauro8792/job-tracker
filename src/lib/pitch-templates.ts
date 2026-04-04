export interface PitchData {
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

export const INITIAL_PITCH_DATA: PitchData = {
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

export type PitchLang = "es" | "en";

export type PitchVariant = {
  id: string;
  title: string;
  description: string;
  content: string;
};

export function buildGeneratedPitchesByLang(d: PitchData): {
  es: Record<string, string>;
  en: Record<string, string>;
} {
  const es = Object.fromEntries(generatePitches(d, "es").map((p) => [p.id, p.content]));
  const en = Object.fromEntries(generatePitches(d, "en").map((p) => [p.id, p.content]));
  return { es, en };
}

export function generatePitches(d: PitchData, lang: PitchLang): PitchVariant[] {
  const es = lang === "es";
  const elevator30s = es
    ? `Hola, soy ${d.name}. Soy ${d.currentRole} con ${d.yearsExperience} años de experiencia, especializado en ${d.mainTechnologies}. En ${d.currentCompany}, ${d.keyAchievement1}. Busco ${d.lookingFor}, donde pueda aportar con lo que ya hice y seguir sumando impacto.`
    : `Hi, I'm ${d.name}. I'm a ${d.currentRole} with ${d.yearsExperience} years of experience specializing in ${d.mainTechnologies}. At ${d.currentCompany}, ${d.keyAchievement1}. I'm looking for ${d.lookingFor} where I can leverage my experience to make a real impact.`;

  const elevator60s = es
    ? `Hola, soy ${d.name}. Soy ${d.currentRole} con ${d.yearsExperience} años de experiencia construyendo sistemas en producción con ${d.mainTechnologies}.

En ${d.currentCompany}, ${d.keyAchievement1}. Además, ${d.keyAchievement2}.

Lo que me diferencia es ${d.uniqueStrength}. También me defino por ser ${d.softSkill}.

Hoy busco ${d.lookingFor}. ${d.whyRemote} Me motivan los equipos donde pueda encarar problemas técnicos desafiantes y seguir creciendo.`
    : `Hi, I'm ${d.name}. I'm a ${d.currentRole} with ${d.yearsExperience} years of experience building production-grade systems with ${d.mainTechnologies}.

At ${d.currentCompany}, ${d.keyAchievement1}. I also ${d.keyAchievement2}.

What sets me apart is ${d.uniqueStrength}. I'm also ${d.softSkill}.

I'm currently looking for ${d.lookingFor}. ${d.whyRemote} I'm excited about opportunities where I can tackle challenging technical problems and continue growing.`;

  const tellMeAboutYourself = es
    ? `Soy ${d.currentRole} con ${d.yearsExperience} años de experiencia práctica. Me especializo en ${d.mainTechnologies}.

Hoy en ${d.currentCompany}, donde ${d.keyAchievement1}. Un logro del que me siento orgulloso es ${d.keyAchievement2}.

Me describiría como ${d.softSkill}, y lo que aporto a cualquier equipo es ${d.uniqueStrength}.

Busco ${d.lookingFor} porque ${d.whyRemote}. Quiero el próximo desafío donde pueda tener más impacto en el producto.`
    : `I'm a ${d.currentRole} with ${d.yearsExperience} years of hands-on experience. I specialize in ${d.mainTechnologies}.

Currently at ${d.currentCompany}, where ${d.keyAchievement1}. One of my proudest achievements was when ${d.keyAchievement2}.

I'd describe myself as ${d.softSkill}, and what I bring to any team is ${d.uniqueStrength}.

I'm looking for ${d.lookingFor} because ${d.whyRemote}. I'm ready for the next challenge where I can have a bigger impact on the product.`;

  const whyHireMe = es
    ? `Deberían contratarme porque tengo ${d.yearsExperience} años de experiencia real con ${d.mainTechnologies}, no solo teoría.

En ${d.currentCompany} demostré que puedo entregar: ${d.keyAchievement1}. También ${d.keyAchievement2}.

Más allá de lo técnico, ${d.uniqueStrength}. Soy ${d.softSkill}, así que me integro rápido al equipo y empiezo a sumar desde el primer día.

Busco específicamente ${d.lookingFor}, y creo que encajo con lo que necesitan.`
    : `You should hire me because I bring ${d.yearsExperience} years of real-world experience in ${d.mainTechnologies}, not just theoretical knowledge.

At ${d.currentCompany}, I've proven I can deliver: ${d.keyAchievement1}. I also ${d.keyAchievement2}.

Beyond technical skills, ${d.uniqueStrength}. I'm ${d.softSkill}, which means I can integrate quickly into your team and start contributing from day one.

I'm specifically looking for ${d.lookingFor}, and I believe this role aligns perfectly with where I want to grow.`;

  const linkedinSummary = es
    ? `${d.currentRole} con ${d.yearsExperience}+ años en ${d.mainTechnologies}. ${d.keyAchievement1} en ${d.currentCompany}. ${d.uniqueStrength}. ${d.softSkill}. Abierto a ${d.lookingFor}.`
    : `${d.currentRole} with ${d.yearsExperience}+ years of experience in ${d.mainTechnologies}. ${d.keyAchievement1} at ${d.currentCompany}. ${d.uniqueStrength}. ${d.softSkill}. Open to ${d.lookingFor}.`;

  const meta = es
    ? {
        elevator30: {
          title: "Presentación corta (30 seg)",
          description:
            "Para cuando te preguntan «¿a qué te dedicás?» en un networking o al inicio de una call.",
        },
        elevator60: {
          title: "Presentación (60 seg · ~1 min)",
          description: "Versión más completa para cuando tenés más tiempo. Ideal para inicios de entrevista.",
        },
        tellme: {
          title: "Contame de vos / Tell me about yourself",
          description: "La pregunta más importante de muchas entrevistas. Estructura clara y concreta.",
        },
        whyhire: {
          title: "¿Por qué deberían contrarte?",
          description: "Tu cierre de venta: confianza y vínculo entre tu experiencia y lo que buscan.",
        },
        linkedin: {
          title: "Resumen para LinkedIn (About)",
          description: "Texto compacto para la sección «Acerca de».",
        },
      }
    : {
        elevator30: {
          title: "Short intro (30 sec)",
          description: "When someone asks what you do—networking or start of a call.",
        },
        elevator60: {
          title: "Longer intro (~1 min)",
          description: "Full version when you have more time; great for interview openings.",
        },
        tellme: {
          title: "Tell me about yourself",
          description: "The classic interview opener—use this structure.",
        },
        whyhire: {
          title: "Why should we hire you?",
          description: "Close with confidence; connect your experience to their needs.",
        },
        linkedin: {
          title: "LinkedIn Summary",
          description: "Short version for your LinkedIn About section.",
        },
      };

  return [
    { id: "elevator30", ...meta.elevator30, content: elevator30s },
    { id: "elevator60", ...meta.elevator60, content: elevator60s },
    { id: "tellme", ...meta.tellme, content: tellMeAboutYourself },
    { id: "whyhire", ...meta.whyhire, content: whyHireMe },
    { id: "linkedin", ...meta.linkedin, content: linkedinSummary },
  ];
}
