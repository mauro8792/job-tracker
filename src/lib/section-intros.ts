/**
 * Textos del modal de primera visita por sección (sidebar).
 * Clave en localStorage: djt_section_intro_v1:<userId>:<sectionId>
 */
export const SECTION_INTRO_IDS = [
  "dashboard",
  "postulaciones",
  "calendar",
  "platforms",
  "checklist",
  "progress",
  "analytics",
  "cv",
  "questions",
  "learning",
  "community",
  "feed",
  "resources",
  "pitch",
  "templates",
] as const;

export type SectionIntroId = (typeof SECTION_INTRO_IDS)[number];

export type SectionIntroCopy = {
  title: string;
  lead: string;
  bullets: string[];
};

export const SECTION_INTRO_CONTENT: Record<SectionIntroId, SectionIntroCopy> = {
  dashboard: {
    title: "¿Para qué sirve el Dashboard?",
    lead: "Es tu punto de entrada: un resumen de la búsqueda sin entrar en cada módulo.",
    bullets: [
      "Números clave: postulaciones, plataformas y ritmo.",
      "Próximas entrevistas y recordatorios.",
      "Atajos al Kanban, checklist y resto de secciones.",
    ],
  },
  postulaciones: {
    title: "¿Para qué sirven las Postulaciones?",
    lead: "Acá seguís cada proceso como en un tablero Kanban, de la wishlist hasta el resultado.",
    bullets: [
      "Arrastrá tarjetas para cambiar estado (Applied, Interview, Offer, etc.).",
      "Entrando al detalle: notas, preparación y entrevistas con fecha.",
      "Te ayuda a no mezclar empresas ni perder el hilo de cada rol.",
    ],
  },
  calendar: {
    title: "¿Para qué sirve Calendario?",
    lead: "Conectás Google Calendar y asociás reuniones a una postulación abierta.",
    bullets: [
      "Ves eventos próximos en un solo lugar.",
      "Podés convertir una reunión en entrevista dentro del detalle de la postulación.",
      "Menos fricción que copiar fechas a mano.",
    ],
  },
  platforms: {
    title: "¿Para qué sirve Plataformas?",
    lead: "Tu mapa personal de portales y bolsas donde buscás trabajo remoto.",
    bullets: [
      "Marcá perfil listo y alertas activas en cada canal.",
      "Usá Completo / Pendiente / Sin empezar para ver dónde falta cerrar el setup.",
      "La barra superior resume cuántas plataformas llevás al día.",
    ],
  },
  checklist: {
    title: "¿Para qué sirve el Checklist diaria?",
    lead: "Lista de hábitos del día (algoritmos, inglés, postulaciones, etc.) que resetea cada día.",
    bullets: [
      "Tildá ítems al completarlos y mirá el progreso del día.",
      "Podés agregar o editar tareas según tu rutina.",
      "Sirve para constancia: pequeños pasos todos los días.",
    ],
  },
  progress: {
    title: "¿Para qué sirve Progreso (semanal)?",
    lead: "Registrás por semana qué hiciste: problemas, postulaciones enviadas, inglés, entrevistas.",
    bullets: [
      "Comparás semanas y ves si mantenés ritmo.",
      "Las metas son editables para ajustar a tu realidad.",
      "Complementa el checklist diario con una vista agregada.",
    ],
  },
  analytics: {
    title: "¿Para qué sirve esta vista de Progreso / Analytics?",
    lead: "Gráficos y embudo a partir de tus postulaciones y entrevistas registradas.",
    bullets: [
      "Ritmo semanal, entrevistas y embudo wishlist → hired.",
      "Insights cuando hay suficientes datos (ratios, tendencias).",
      "Te ayuda a decidir si subir volumen o mejorar conversión (CV, roles, etc.).",
    ],
  },
  cv: {
    title: "¿Para qué sirve Mi CV?",
    lead: "Subís tu CV en PDF, lo descargás y tenés guía ATS y tips en una sola pantalla.",
    bullets: [
      "Un lugar para el documento que usás en las postulaciones.",
      "Recomendaciones para pasar filtros automáticos.",
      "Cover letter y plantillas se relacionan con el resto de la app.",
    ],
  },
  questions: {
    title: "¿Para qué sirve Preguntas?",
    lead: "Banco de preguntas tipo flashcard: técnica, behavioral, por tags.",
    bullets: [
      "Practicá respuestas sin depender solo de memoria en la entrevista.",
      "Podés sumar tus propias preguntas y marcar favoritas.",
      "Comunidad: en el futuro podés compartir material con otros devs.",
    ],
  },
  learning: {
    title: "¿Para qué sirve Learning Path?",
    lead: "Rutas de estudio por tecnología: temas, links y progreso por tema.",
    bullets: [
      "Organizá el estudio largo (no solo el día a día del checklist).",
      "Cloná paths públicos de la comunidad cuando existan.",
      "Ideal para preparar stacks concretos para entrevistas.",
    ],
  },
  community: {
    title: "¿Para qué sirve Comunidad?",
    lead: "Espacio para compartir y ver contenido de otros devs en la misma búsqueda.",
    bullets: [
      "Learning paths y preguntas pueden tener cara de comunidad.",
      "Menos aislamiento en el proceso de búsqueda laboral.",
      "El detalle depende de lo que el producto habilite en cada fase.",
    ],
  },
  feed: {
    title: "¿Para qué sirve Feed & bolsa?",
    lead: "Novedades, ofertas compartidas y conversaciones tipo feed de la comunidad.",
    bullets: [
      "Enterate de oportunidades y experiencias sin salir de la app.",
      "Complementa las alertas de las plataformas con señal social.",
      "Útil cuando la comunidad publica contenido nuevo.",
    ],
  },
  resources: {
    title: "¿Para qué sirven Recursos?",
    lead: "Lista curada de links por tema: algoritmos, system design, inglés, behavioral, etc.",
    bullets: [
      "Menos tiempo buscando en Google: arrancás desde material ya filtrado.",
      "No reemplaza practicar, pero ordena por dónde empezar.",
      "Podés combinarlo con Learning Path y checklist.",
    ],
  },
  pitch: {
    title: "¿Para qué sirve Presentación?",
    lead: "Armá tu pitch personal (30s, 60s, etc.) para “contame de vos” en entrevistas.",
    bullets: [
      "Wizard paso a paso para no dejar el speech al azar.",
      "Coherente con tu CV y con lo que postulás.",
      "Practicá en voz alta usando el texto que generaste.",
    ],
  },
  templates: {
    title: "¿Para qué sirven Templates?",
    lead: "Respuestas modelo en EN/ES para behavioral, motivación y situaciones típicas.",
    bullets: [
      "Editá el texto y reemplazá variables con tu historia.",
      "Ahorrás tiempo en cartas y mails repetitivos.",
      "Encaja con Preguntas y con la preparación de entrevistas.",
    ],
  },
};
