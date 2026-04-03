export type ApplicationStatus = "wishlist" | "applied" | "interview" | "offer" | "hired" | "rejected";

export type InterviewType = "technical" | "behavioral" | "hr" | "system-design" | "take-home" | "other";

export interface InterviewEntry {
  id: string;
  type: InterviewType;
  date: string;
  time?: string;
  notes: string;
  result?: "passed" | "failed" | "pending";
  /** Link al evento en Google Calendar si se creó desde la app. */
  calendarHtmlLink?: string;
  /** Id del evento en Google (importado o creado desde la app). */
  googleEventId?: string;
}

/** Evento próximo devuelto por GET /calendar/events/upcoming */
export interface GoogleCalendarListItem {
  id: string;
  summary: string;
  start: string;
  end: string;
  /** YYYY-MM-DD (zona API) para ubicar en el calendario mensual */
  startDate: string;
  /** HH:mm o null si es día completo */
  startTime: string | null;
  /** Timestamp de inicio para ordenar */
  startMs: number;
  htmlLink: string | null;
  alreadyInApp: boolean;
}

export interface PrepItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface Application {
  id: string;
  company: string;
  role: string;
  platform: string;
  salary?: string;
  url?: string;
  notes?: string;
  status: ApplicationStatus;
  appliedDate: string;
  updatedDate: string;
  prepItems?: PrepItem[];
  interviews?: InterviewEntry[];
  journalNotes?: string;
}

export const INTERVIEW_TYPES: { id: InterviewType; label: string; color: string }[] = [
  { id: "hr", label: "HR / Screening", color: "bg-blue-500/15 text-blue-400" },
  { id: "technical", label: "T\u00e9cnica (coding)", color: "bg-purple-500/15 text-purple-400" },
  { id: "behavioral", label: "Behavioral", color: "bg-amber-500/15 text-amber-400" },
  { id: "system-design", label: "System Design", color: "bg-emerald-500/15 text-emerald-400" },
  { id: "take-home", label: "Take-home / Challenge", color: "bg-pink-500/15 text-pink-400" },
  { id: "other", label: "Otra", color: "bg-zinc-500/15 text-zinc-400" },
];

export interface Platform {
  id: string;
  name: string;
  url: string;
  status: "complete" | "pending" | "not_started";
  notes?: string;
  hasProfile: boolean;
  hasAlerts: boolean;
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: "algorithms" | "english" | "applications" | "other";
  completed: boolean;
  date: string;
}

export interface WeeklyProgress {
  weekStart: string;
  problemsSolved: number;
  applicationsSubmitted: number;
  englishMinutes: number;
  interviewsCompleted: number;
}

export type TemplateCategory = "behavioral" | "motivation" | "technical" | "general";

export interface Template {
  id: string;
  title: string;
  category: TemplateCategory;
  content: string;
  contentEs?: string;
  variables?: string[];
  isCustom?: boolean;
}

export interface Question {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  createdAt: string;
  visibility?: "private" | "public";
}

/** Lista exploración comunidad (preview de respuesta). */
export interface ExploreQuestion {
  id: string;
  question: string;
  answerPreview: string;
  tags: string[];
  authorName: string;
  updatedAt: string;
  likeCount: number;
  likedByMe: boolean;
}

export interface ExploreLearningPath {
  id: string;
  name: string;
  icon?: string;
  tags: string[];
  topicCount: number;
  authorName: string;
  updatedAt: string;
  /** Promedio 1–5 o null si nadie votó aún. */
  averageStars: number | null;
  ratingCount: number;
  /** Valoración del usuario actual (1–5) o null. */
  myStars: number | null;
}

/** Comentario en recurso público (comunidad). */
export interface CommunityComment {
  id: string;
  authorId: string;
  body: string;
  authorName: string;
  createdAt: string;
}

export type FeedPostKind = "story" | "opportunity";

/** Post del feed (historias) o bolsa (oportunidades). */
export interface FeedPost {
  id: string;
  kind: FeedPostKind;
  title: string;
  body: string;
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  likedByMe: boolean;
}

export interface LearningTopic {
  id: string;
  title: string;
  url?: string;
  completed: boolean;
}

export interface LearningPath {
  id: string;
  name: string;
  icon?: string;
  tags: string[];
  topics: LearningTopic[];
  /** Solo en API; default private si no viene */
  visibility?: "private" | "public";
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  comment: string;
  createdAt: string;
  /** Foto del usuario (Google) si existe. */
  avatar?: string;
}

/** Respuesta GET /users/public/:slug (sin email). */
export interface JobSearchStats {
  applicationsTotal: number;
  hiredCount: number;
  offersCount: number;
  interviewsStageCount: number;
}

export interface PublicProfile {
  slug: string;
  firstName: string;
  lastName: string;
  avatar: string;
  bio: string;
  stats: JobSearchStats;
}

export const APPLICATION_COLUMNS: { id: ApplicationStatus; title: string; color: string }[] = [
  { id: "wishlist", title: "Wishlist", color: "bg-zinc-500" },
  { id: "applied", title: "Applied", color: "bg-blue-500" },
  { id: "interview", title: "Interview", color: "bg-amber-500" },
  { id: "offer", title: "Offer", color: "bg-emerald-500" },
  { id: "hired", title: "Hired! 🎉", color: "bg-primary" },
  { id: "rejected", title: "Rejected", color: "bg-red-500" },
];
