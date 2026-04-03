import { apiFetch } from "./api";
import { MOCK_QUESTIONS, MOCK_LEARNING_PATHS } from "./data";
import type {
  Application,
  Platform,
  ChecklistItem,
  WeeklyProgress,
  Template,
  Question,
  ExploreQuestion,
  LearningPath,
  ExploreLearningPath,
  CommunityComment,
  FeedPost,
  FeedPostKind,
  PublicProfile,
  Testimonial,
  GoogleCalendarListItem,
  InterviewType,
} from "./types";

function normalize<T extends { _id?: string; id?: string }>(item: T): T {
  if (item._id && !item.id) {
    return { ...item, id: item._id };
  }
  return item;
}

function normalizeList<T extends { _id?: string; id?: string }>(items: T[]): T[] {
  return items.map(normalize);
}

export const apiStore = {
  // Applications
  getApplications: async (): Promise<Application[]> => {
    const data = await apiFetch<any[]>("/applications");
    return normalizeList(data);
  },
  addApplication: async (app: Omit<Application, "id" | "updatedDate">): Promise<Application> => {
    const data = await apiFetch<any>("/applications", {
      method: "POST",
      body: JSON.stringify(app),
    });
    return normalize(data);
  },
  updateApplication: async (id: string, updates: Partial<Application>): Promise<void> => {
    await apiFetch(`/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },
  deleteApplication: async (id: string): Promise<void> => {
    await apiFetch(`/applications/${id}`, { method: "DELETE" });
  },
  getApplication: async (id: string): Promise<Application> => {
    const data = await apiFetch<any>(`/applications/${id}`);
    return normalize(data);
  },

  // Platforms
  getPlatforms: async (): Promise<Platform[]> => {
    const data = await apiFetch<any[]>("/platforms");
    return normalizeList(data);
  },
  addPlatform: async (platform: Omit<Platform, "id">): Promise<Platform> => {
    const data = await apiFetch<any>("/platforms", {
      method: "POST",
      body: JSON.stringify(platform),
    });
    return normalize(data);
  },
  updatePlatform: async (id: string, updates: Partial<Platform>): Promise<void> => {
    await apiFetch(`/platforms/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },
  deletePlatform: async (id: string): Promise<void> => {
    await apiFetch(`/platforms/${id}`, { method: "DELETE" });
  },

  // Checklist
  getTodayChecklist: async (): Promise<ChecklistItem[]> => {
    const data = await apiFetch<any[]>("/checklist/today");
    return normalizeList(data);
  },
  getAllChecklist: async (): Promise<ChecklistItem[]> => {
    const data = await apiFetch<any[]>("/checklist");
    return normalizeList(data);
  },
  toggleChecklistItem: async (id: string): Promise<void> => {
    await apiFetch(`/checklist/${id}/toggle`, { method: "PATCH" });
  },
  updateChecklistItem: async (id: string, label: string): Promise<void> => {
    await apiFetch(`/checklist/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ label }),
    });
  },
  addChecklistItem: async (label: string, category: string): Promise<void> => {
    await apiFetch("/checklist", {
      method: "POST",
      body: JSON.stringify({ label, category }),
    });
  },
  deleteChecklistItem: async (id: string): Promise<void> => {
    await apiFetch(`/checklist/${id}`, { method: "DELETE" });
  },

  // Progress
  getWeeklyProgress: async (): Promise<WeeklyProgress[]> => {
    const data = await apiFetch<any[]>("/progress");
    return normalizeList(data);
  },
  addWeeklyProgress: async (progress: WeeklyProgress): Promise<void> => {
    await apiFetch("/progress", {
      method: "POST",
      body: JSON.stringify(progress),
    });
  },

  // Templates
  getTemplates: async (): Promise<Template[]> => {
    const data = await apiFetch<any[]>("/templates");
    return normalizeList(data);
  },
  saveTemplate: async (template: Omit<Template, "id"> & { id?: string }): Promise<void> => {
    if (template.id) {
      await apiFetch(`/templates/${template.id}`, {
        method: "PATCH",
        body: JSON.stringify(template),
      });
    } else {
      await apiFetch("/templates", {
        method: "POST",
        body: JSON.stringify(template),
      });
    }
  },
  deleteTemplate: async (id: string): Promise<void> => {
    await apiFetch(`/templates/${id}`, { method: "DELETE" });
  },

  // Questions
  getQuestions: async (): Promise<Question[]> => {
    const data = await apiFetch<any[]>("/questions");
    return normalizeList(data);
  },
  addQuestion: async (q: Omit<Question, "id" | "createdAt">): Promise<Question> => {
    const data = await apiFetch<any>("/questions", {
      method: "POST",
      body: JSON.stringify(q),
    });
    return normalize(data);
  },
  updateQuestion: async (id: string, updates: Partial<Question>): Promise<void> => {
    await apiFetch(`/questions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },
  deleteQuestion: async (id: string): Promise<void> => {
    await apiFetch(`/questions/${id}`, { method: "DELETE" });
  },

  getExploreQuestions: async (): Promise<ExploreQuestion[]> => {
    const data = await apiFetch<any[]>("/questions/explore");
    return normalizeList(data) as ExploreQuestion[];
  },

  cloneQuestion: async (sourceId: string): Promise<Question> => {
    const data = await apiFetch<any>(`/questions/${sourceId}/clone`, { method: "POST" });
    return normalize(data);
  },

  // Learning Paths
  getLearningPaths: async (): Promise<LearningPath[]> => {
    const data = await apiFetch<any[]>("/learning-paths");
    return normalizeList(data);
  },
  addLearningPath: async (
    name: string,
    icon?: string,
    tags: string[] = [],
    visibility?: "private" | "public",
  ): Promise<LearningPath> => {
    const body: Record<string, unknown> = { name, icon, tags };
    if (visibility) body.visibility = visibility;
    const data = await apiFetch<any>("/learning-paths", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return normalize(data);
  },

  getExploreLearningPaths: async (): Promise<ExploreLearningPath[]> => {
    const data = await apiFetch<any[]>("/learning-paths/explore");
    return normalizeList(data) as ExploreLearningPath[];
  },

  cloneLearningPath: async (sourceId: string): Promise<LearningPath> => {
    const data = await apiFetch<any>(`/learning-paths/${sourceId}/clone`, { method: "POST" });
    return normalize(data);
  },

  getFeedPosts: async (kind?: FeedPostKind): Promise<FeedPost[]> => {
    const q = kind ? `?kind=${encodeURIComponent(kind)}` : "";
    const data = await apiFetch<any[]>(`/feed/posts${q}`);
    return normalizeList(data) as FeedPost[];
  },

  createFeedPost: async (payload: {
    kind: FeedPostKind;
    title: string;
    body: string;
    tags?: string[];
  }): Promise<FeedPost> => {
    const data = await apiFetch<any>("/feed/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalize(data) as FeedPost;
  },

  updateFeedPost: async (
    id: string,
    updates: Partial<{ kind: FeedPostKind; title: string; body: string; tags: string[] }>,
  ): Promise<void> => {
    await apiFetch(`/feed/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  deleteFeedPost: async (id: string): Promise<void> => {
    await apiFetch(`/feed/posts/${id}`, { method: "DELETE" });
  },

  toggleCommunityLike: async (
    resourceType: "learning_path" | "question" | "feed_post",
    resourceId: string,
  ): Promise<{ liked: boolean; likeCount: number }> => {
    return apiFetch("/community/likes/toggle", {
      method: "POST",
      body: JSON.stringify({ resourceType, resourceId }),
    });
  },

  setCommunityRating: async (
    resourceType: "learning_path",
    resourceId: string,
    stars: number,
  ): Promise<{ averageStars: number | null; ratingCount: number; myStars: number | null }> => {
    return apiFetch("/community/ratings", {
      method: "POST",
      body: JSON.stringify({ resourceType, resourceId, stars }),
    });
  },

  getCommunityComments: async (
    resourceType: "learning_path" | "question" | "feed_post",
    resourceId: string,
  ): Promise<CommunityComment[]> => {
    const q = new URLSearchParams({ resourceType, resourceId });
    return apiFetch<CommunityComment[]>(`/community/comments?${q.toString()}`);
  },

  postCommunityComment: async (
    resourceType: "learning_path" | "question" | "feed_post",
    resourceId: string,
    body: string,
  ): Promise<void> => {
    await apiFetch("/community/comments", {
      method: "POST",
      body: JSON.stringify({ resourceType, resourceId, body }),
    });
  },

  deleteCommunityComment: async (id: string): Promise<void> => {
    await apiFetch(`/community/comments/${id}`, { method: "DELETE" });
  },

  updateLearningPath: async (id: string, updates: Partial<LearningPath>): Promise<void> => {
    await apiFetch(`/learning-paths/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },
  deleteLearningPath: async (id: string): Promise<void> => {
    await apiFetch(`/learning-paths/${id}`, { method: "DELETE" });
  },
  addTopic: async (
    pathId: string,
    title: string,
    url?: string,
    completed?: boolean,
  ): Promise<void> => {
    const body: Record<string, unknown> = { title };
    if (url !== undefined && url !== "") body.url = url;
    if (completed !== undefined) body.completed = completed;
    await apiFetch(`/learning-paths/${pathId}/topics`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /** Preguntas y learning paths de ejemplo en la API (usuario actual vía JWT). Omite duplicados por texto de pregunta / nombre de path. */
  seedDemoData: async (): Promise<{ questions: number; paths: number }> => {
    const [existingQ, existingPaths] = await Promise.all([
      apiStore.getQuestions(),
      apiStore.getLearningPaths(),
    ]);
    const qSeen = new Set(existingQ.map((q) => q.question.trim()));
    let questions = 0;
    for (const q of MOCK_QUESTIONS) {
      const key = q.question.trim();
      if (qSeen.has(key)) continue;
      await apiStore.addQuestion(q);
      qSeen.add(key);
      questions++;
    }
    const pathSeen = new Set(existingPaths.map((p) => p.name.trim()));
    let paths = 0;
    for (const mock of MOCK_LEARNING_PATHS) {
      const key = mock.name.trim();
      if (pathSeen.has(key)) continue;
      const created = await apiStore.addLearningPath(mock.name, mock.icon, mock.tags);
      for (const t of mock.topics) {
        await apiStore.addTopic(created.id, t.title, t.url, t.completed);
      }
      pathSeen.add(key);
      paths++;
    }
    return { questions, paths };
  },
  toggleTopic: async (pathId: string, topicId: string): Promise<void> => {
    await apiFetch(`/learning-paths/${pathId}/topics/${topicId}/toggle`, {
      method: "PATCH",
    });
  },
  deleteTopic: async (pathId: string, topicId: string): Promise<void> => {
    await apiFetch(`/learning-paths/${pathId}/topics/${topicId}`, {
      method: "DELETE",
    });
  },

  // Pitch
  getPitch: async () => {
    const data = await apiFetch<any>("/pitch");
    return data;
  },
  savePitch: async (pitchData: object): Promise<void> => {
    await apiFetch("/pitch", {
      method: "PUT",
      body: JSON.stringify(pitchData),
    });
  },

  // Testimonials
  getTestimonials: async (): Promise<Testimonial[]> => {
    const data = await apiFetch<any[]>("/testimonials");
    return normalizeList(data);
  },
  addTestimonial: async (t: Omit<Testimonial, "id" | "createdAt">): Promise<Testimonial> => {
    const data = await apiFetch<any>("/testimonials", {
      method: "POST",
      body: JSON.stringify(t),
    });
    return normalize(data);
  },

  getPublicProfile: async (slug: string): Promise<PublicProfile> => {
    return apiFetch<PublicProfile>(`/users/public/${encodeURIComponent(slug)}`);
  },

  uploadCv: async (file: File): Promise<void> => {
    const fd = new FormData();
    fd.append("file", file);
    await apiFetch("/users/me/cv", {
      method: "POST",
      body: fd,
    });
  },

  deleteCv: async (): Promise<void> => {
    await apiFetch("/users/me/cv", { method: "DELETE" });
  },

  updateCoverLetterText: async (text: string): Promise<void> => {
    await apiFetch("/users/me/cover-letter/text", {
      method: "PATCH",
      body: JSON.stringify({ text }),
    });
  },

  uploadCoverLetterPdf: async (file: File): Promise<void> => {
    const fd = new FormData();
    fd.append("file", file);
    await apiFetch("/users/me/cover-letter/pdf", {
      method: "POST",
      body: fd,
    });
  },

  deleteCoverLetterPdf: async (): Promise<void> => {
    await apiFetch("/users/me/cover-letter/pdf", { method: "DELETE" });
  },

  updateMe: async (updates: {
    firstName?: string;
    lastName?: string;
    publicProfileEnabled?: boolean;
    publicSlug?: string | null;
    publicBio?: string;
    templatesLang?: "en" | "es";
  }): Promise<void> => {
    await apiFetch("/users/me", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  getCalendarConnectUrl: async (): Promise<{ url: string }> => {
    return apiFetch<{ url: string }>("/calendar/connect/google");
  },

  disconnectCalendar: async (): Promise<void> => {
    await apiFetch("/calendar/connect", { method: "DELETE" });
  },

  createInterviewCalendarEvent: async (
    applicationId: string,
    interviewId: string,
  ): Promise<{ htmlLink: string; alreadyLinked: boolean }> => {
    return apiFetch("/calendar/events/interview", {
      method: "POST",
      body: JSON.stringify({ applicationId, interviewId }),
    });
  },

  getCalendarUpcomingEvents: async (
    days = 21,
  ): Promise<{ events: GoogleCalendarListItem[] }> => {
    return apiFetch<{ events: GoogleCalendarListItem[] }>(
      `/calendar/events/upcoming?days=${days}`,
    );
  },

  linkCalendarEventToApplication: async (body: {
    applicationId: string;
    googleEventId: string;
    type?: InterviewType;
  }): Promise<{ applicationId: string; interviewId: string; htmlLink: string | null }> => {
    return apiFetch("/calendar/events/link", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /** Oculta el evento en esta pantalla; no lo borra en Google Calendar. */
  dismissCalendarEvent: async (googleEventId: string): Promise<{ ok: boolean }> => {
    return apiFetch("/calendar/events/dismiss", {
      method: "POST",
      body: JSON.stringify({ googleEventId }),
    });
  },
};
