export interface Resource {
  id: string;
  name: string;
  url: string;
  description: string;
  category: ResourceCategory;
  difficulty?: "beginner" | "intermediate" | "advanced";
  free: boolean;
  tags: string[];
}

export type ResourceCategory = "algorithms" | "system-design" | "english" | "behavioral" | "general";

export const RESOURCE_CATEGORIES: { id: ResourceCategory; label: string; emoji: string }[] = [
  { id: "algorithms", label: "Algoritmos & DSA", emoji: "🧠" },
  { id: "system-design", label: "System Design", emoji: "🏗️" },
  { id: "english", label: "Inglés técnico", emoji: "🌎" },
  { id: "behavioral", label: "Behavioral", emoji: "🎯" },
  { id: "general", label: "General", emoji: "📚" },
];

export const RESOURCES: Resource[] = [
  // Algorithms & DSA
  {
    id: "neetcode",
    name: "NeetCode",
    url: "https://neetcode.io",
    description: "Roadmap de 150 problemas organizados por patrón. Ideal para empezar. Tiene videos explicativos para cada problema.",
    category: "algorithms",
    difficulty: "beginner",
    free: true,
    tags: ["roadmap", "videos", "patrones"],
  },
  {
    id: "leetcode",
    name: "LeetCode",
    url: "https://leetcode.com",
    description: "La plataforma más popular. Tiene +2800 problemas, contests semanales, y es la que usan las empresas para entrevistas.",
    category: "algorithms",
    difficulty: "intermediate",
    free: true,
    tags: ["problemas", "contests", "entrevistas"],
  },
  {
    id: "hackerrank",
    name: "HackerRank",
    url: "https://hackerrank.com",
    description: "Buena para practicar lo básico. Muchas empresas la usan para assessments técnicos iniciales.",
    category: "algorithms",
    difficulty: "beginner",
    free: true,
    tags: ["assessments", "certificaciones", "básico"],
  },
  {
    id: "codewars",
    name: "Codewars",
    url: "https://codewars.com",
    description: "Problemas tipo kata organizados por dificultad (kyu). Buenos para practicar lo fundamental de JavaScript/TypeScript.",
    category: "algorithms",
    difficulty: "beginner",
    free: true,
    tags: ["katas", "fundamentals", "JS/TS"],
  },
  {
    id: "exercism",
    name: "Exercism",
    url: "https://exercism.org",
    description: "Ejercicios mentorizados en +60 lenguajes. Ideal para mejorar tu estilo de código y aprender buenas prácticas.",
    category: "algorithms",
    difficulty: "beginner",
    free: true,
    tags: ["mentorship", "buenas prácticas", "multi-lenguaje"],
  },
  {
    id: "algoexpert",
    name: "AlgoExpert",
    url: "https://algoexpert.io",
    description: "160 problemas curados con videos explicativos paso a paso. Más enfocado y menos overwhelming que LeetCode.",
    category: "algorithms",
    difficulty: "intermediate",
    free: false,
    tags: ["curado", "videos", "paso a paso"],
  },
  {
    id: "blind75",
    name: "Blind 75",
    url: "https://neetcode.io/practice",
    description: "Los 75 problemas más frecuentes en entrevistas FAANG. Si tenés poco tiempo, empezá por acá.",
    category: "algorithms",
    difficulty: "intermediate",
    free: true,
    tags: ["FAANG", "esencial", "frecuentes"],
  },

  // System Design
  {
    id: "system-design-primer",
    name: "System Design Primer",
    url: "https://github.com/donnemartin/system-design-primer",
    description: "El recurso más completo y gratuito. Cubre todo: escalabilidad, caching, load balancing, databases, etc.",
    category: "system-design",
    difficulty: "intermediate",
    free: true,
    tags: ["completo", "GitHub", "referencia"],
  },
  {
    id: "bytebytego",
    name: "ByteByteGo",
    url: "https://bytebytego.com",
    description: "Newsletter y curso de Alex Xu (autor de System Design Interview). Diagramas excelentes y explicaciones claras.",
    category: "system-design",
    difficulty: "intermediate",
    free: false,
    tags: ["newsletter", "diagramas", "Alex Xu"],
  },
  {
    id: "designgurus",
    name: "Design Gurus",
    url: "https://designgurus.io",
    description: "Curso de Grokking System Design. Muy popular para preparar entrevistas de system design en FAANG.",
    category: "system-design",
    difficulty: "advanced",
    free: false,
    tags: ["curso", "Grokking", "FAANG"],
  },
  {
    id: "highscalability",
    name: "High Scalability",
    url: "http://highscalability.com",
    description: "Blog con case studies de arquitecturas reales (Netflix, Uber, etc). Muy bueno para entender decisiones de diseño.",
    category: "system-design",
    difficulty: "advanced",
    free: true,
    tags: ["case studies", "arquitectura real", "blog"],
  },

  // English
  {
    id: "cambly",
    name: "Cambly",
    url: "https://cambly.com",
    description: "Conversaciones con nativos 24/7. Ideal para perder el miedo y practicar speaking técnico.",
    category: "english",
    difficulty: "beginner",
    free: false,
    tags: ["speaking", "nativos", "flexible"],
  },
  {
    id: "italki",
    name: "iTalki",
    url: "https://italki.com",
    description: "Profesores particulares de inglés. Podés buscar uno que tenga experiencia con inglés técnico/IT.",
    category: "english",
    difficulty: "beginner",
    free: false,
    tags: ["profesores", "personalizado", "IT"],
  },
  {
    id: "pramp",
    name: "Pramp",
    url: "https://pramp.com",
    description: "Mock interviews gratis con otros devs. Practicás entrevistas técnicas en inglés con personas reales.",
    category: "english",
    difficulty: "intermediate",
    free: true,
    tags: ["mock interviews", "peer", "técnico"],
  },
  {
    id: "english-greg",
    name: "English with Greg (YouTube)",
    url: "https://youtube.com/@EnglishwithGreg",
    description: "Canal de YouTube enfocado en inglés para developers. Tips para entrevistas técnicas en inglés.",
    category: "english",
    difficulty: "beginner",
    free: true,
    tags: ["YouTube", "developers", "entrevistas"],
  },
  {
    id: "techinterviewenglish",
    name: "Tech Interview English",
    url: "https://youtube.com/results?search_query=tech+interview+english+for+developers",
    description: "Buscá 'tech interview English' en YouTube. Hay mucho contenido gratuito para mejorar tu vocabulario técnico.",
    category: "english",
    difficulty: "intermediate",
    free: true,
    tags: ["vocabulario", "YouTube", "free"],
  },

  // Behavioral
  {
    id: "star-method",
    name: "STAR Method Guide",
    url: "https://www.themuse.com/advice/star-interview-method",
    description: "Guía completa del método STAR (Situation, Task, Action, Result) para responder preguntas behavioral.",
    category: "behavioral",
    difficulty: "beginner",
    free: true,
    tags: ["STAR", "guía", "framework"],
  },
  {
    id: "behavioral-questions",
    name: "Top 50 Behavioral Questions",
    url: "https://leetcode.com/discuss/interview-question/437082/",
    description: "Las 50 preguntas behavioral más comunes en entrevistas tech. Preparate al menos 10.",
    category: "behavioral",
    difficulty: "intermediate",
    free: true,
    tags: ["preguntas", "top 50", "preparación"],
  },
  {
    id: "interviewing-io",
    name: "Interviewing.io",
    url: "https://interviewing.io",
    description: "Mock interviews anónimas con ingenieros de FAANG. Feedback real después de cada sesión.",
    category: "behavioral",
    difficulty: "intermediate",
    free: false,
    tags: ["mock interviews", "FAANG", "feedback"],
  },

  // General
  {
    id: "levels-fyi",
    name: "Levels.fyi",
    url: "https://levels.fyi",
    description: "Comparación de salarios por empresa, nivel y ubicación. Investigá cuánto pagan antes de negociar.",
    category: "general",
    free: true,
    tags: ["salarios", "comparación", "negociación"],
  },
  {
    id: "glassdoor",
    name: "Glassdoor",
    url: "https://glassdoor.com",
    description: "Reviews de empresas, salarios y preguntas de entrevistas reportadas por candidatos.",
    category: "general",
    free: true,
    tags: ["reviews", "salarios", "preguntas"],
  },
  {
    id: "teamblind",
    name: "Blind (TeamBlind)",
    url: "https://teamblind.com",
    description: "Foro anónimo de empleados tech. Info sobre compensación, entrevistas y cultura de empresas.",
    category: "general",
    free: true,
    tags: ["foro", "compensación", "anónimo"],
  },
];
