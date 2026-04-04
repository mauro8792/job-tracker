"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiStore } from "@/lib/api-store";
import { AppSectionIntro } from "@/components/SectionIntroModal";
import { useAuth } from "@/lib/auth";
import { ExploreLearningPath, ExploreQuestion, CommunityComment } from "@/lib/types";
import {
  Users,
  GraduationCap,
  Loader2,
  Copy,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Heart,
  Star,
  MessageCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type Tab = "paths" | "questions";

function resourceKey(kind: "learning_path" | "question", id: string) {
  return `${kind}:${id}`;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("paths");
  const [paths, setPaths] = useState<ExploreLearningPath[]>([]);
  const [questions, setQuestions] = useState<ExploreQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [cloneKind, setCloneKind] = useState<Tab | null>(null);
  const [justCloned, setJustCloned] = useState<{ kind: Tab; id: string } | null>(null);

  const [likingKey, setLikingKey] = useState<string | null>(null);
  const [ratingPathId, setRatingPathId] = useState<string | null>(null);
  const [starHover, setStarHover] = useState<{ pathId: string; stars: number } | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [commentsByKey, setCommentsByKey] = useState<Record<string, CommunityComment[]>>({});
  const [commentsLoadingKey, setCommentsLoadingKey] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [postingKey, setPostingKey] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    Promise.all([apiStore.getExploreLearningPaths(), apiStore.getExploreQuestions()])
      .then(([p, q]) => {
        setPaths(p);
        setQuestions(q);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "No se pudo cargar la comunidad");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleClonePath = async (id: string) => {
    setCloningId(id);
    setCloneKind("paths");
    setJustCloned(null);
    try {
      await apiStore.cloneLearningPath(id);
      setJustCloned({ kind: "paths", id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo clonar");
    } finally {
      setCloningId(null);
      setCloneKind(null);
    }
  };

  const handleCloneQuestion = async (id: string) => {
    setCloningId(id);
    setCloneKind("questions");
    setJustCloned(null);
    try {
      await apiStore.cloneQuestion(id);
      setJustCloned({ kind: "questions", id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo clonar");
    } finally {
      setCloningId(null);
      setCloneKind(null);
    }
  };

  const setPathRating = async (id: string, stars: number) => {
    if (!user) return;
    setRatingPathId(id);
    try {
      const stats = await apiStore.setCommunityRating("learning_path", id, stars);
      setPaths((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                averageStars: stats.averageStars,
                ratingCount: stats.ratingCount,
                myStars: stats.myStars,
              }
            : p,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar la valoración");
    } finally {
      setRatingPathId(null);
    }
  };

  const toggleLikeQuestion = async (id: string) => {
    if (!user) return;
    const key = resourceKey("question", id);
    setLikingKey(key);
    try {
      const { liked, likeCount } = await apiStore.toggleCommunityLike("question", id);
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, likedByMe: liked, likeCount } : q)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar el like");
    } finally {
      setLikingKey(null);
    }
  };

  const fetchComments = async (kind: "learning_path" | "question", id: string) => {
    const key = resourceKey(kind, id);
    setCommentsLoadingKey(key);
    try {
      const list = await apiStore.getCommunityComments(kind, id);
      setCommentsByKey((prev) => ({ ...prev, [key]: list }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los comentarios");
    } finally {
      setCommentsLoadingKey(null);
    }
  };

  const toggleComments = (kind: "learning_path" | "question", id: string) => {
    const key = resourceKey(kind, id);
    if (expandedKey === key) {
      setExpandedKey(null);
      return;
    }
    setExpandedKey(key);
    if (!commentsByKey[key]) {
      void fetchComments(kind, id);
    }
  };

  const postComment = async (kind: "learning_path" | "question", id: string) => {
    if (!user) return;
    const key = resourceKey(kind, id);
    const body = (commentDraft[key] || "").trim();
    if (!body) return;
    setPostingKey(key);
    try {
      await apiStore.postCommunityComment(kind, id, body);
      setCommentDraft((d) => ({ ...d, [key]: "" }));
      await fetchComments(kind, id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo publicar el comentario");
    } finally {
      setPostingKey(null);
    }
  };

  const removeComment = async (kind: "learning_path" | "question", id: string, commentId: string) => {
    setDeletingCommentId(commentId);
    try {
      await apiStore.deleteCommunityComment(commentId);
      const key = resourceKey(kind, id);
      await fetchComments(kind, id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo borrar el comentario");
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <AppSectionIntro sectionId="community" />
      <div>
        <div className="flex items-center gap-2 text-primary mb-1">
          <Users className="h-6 w-6" />
          <span className="text-xs font-semibold uppercase tracking-wide">Fase 3 — Comunidad</span>
        </div>
        <h1 className="text-2xl font-bold text-text">Comunidad</h1>
        <p className="text-text-muted text-sm mt-1 max-w-2xl">
          Contenido que otros usuarios marcaron como público. Cloná a tu cuenta para editar y seguir tu propio
          progreso. En los paths podés valorar con estrellas; en las preguntas, me gusta y comentarios. Para publicar el
          tuyo:{" "}
          <Link href="/learning" className="text-primary hover:underline">
            Learning Path
          </Link>{" "}
          o{" "}
          <Link href="/questions" className="text-primary hover:underline">
            Preguntas
          </Link>
          .
        </p>
      </div>

      <div className="flex gap-2 border-b border-border pb-px">
        <button
          type="button"
          onClick={() => setTab("paths")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
            tab === "paths"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          Learning paths
        </button>
        <button
          type="button"
          onClick={() => setTab("questions")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
            tab === "questions"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          Preguntas
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-text-muted rounded-xl border border-border bg-surface">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando…
        </div>
      ) : tab === "paths" ? (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-text flex items-center gap-2 mb-4">
            <GraduationCap className="h-4 w-4 text-primary" />
            Paths públicos
          </h2>
          {paths.length === 0 ? (
            <p className="text-center py-10 text-text-muted text-sm">
              Todavía no hay paths públicos. Publicá uno desde{" "}
              <Link href="/learning" className="text-primary hover:underline">
                Learning Path
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-3">
              {paths.map((p) => {
                const key = resourceKey("learning_path", p.id);
                const expanded = expandedKey === key;
                const comments = commentsByKey[key] ?? [];
                const ratingBusy = ratingPathId === p.id;
                const hoverN = starHover?.pathId === p.id ? starHover.stars : null;
                const filledThrough = hoverN ?? p.myStars ?? 0;
                return (
                  <li
                    key={p.id}
                    className="rounded-lg border border-border bg-background/50 px-4 py-3 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-xl shrink-0">{p.icon || "📚"}</span>
                        <div className="min-w-0">
                          <p className="font-medium text-text">{p.name}</p>
                          <p className="text-xs text-text-muted mt-0.5">
                            Por {p.authorName} · {p.topicCount} temas
                          </p>
                          {(p.tags || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {p.tags.map((t) => (
                                <span
                                  key={t}
                                  className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0 sm:ml-auto">
                        <div
                          className="flex flex-col items-end gap-1 rounded-lg border border-border bg-surface/80 px-2 py-1.5"
                          onMouseLeave={() => setStarHover(null)}
                        >
                          <div className="text-[11px] text-text-muted tabular-nums whitespace-nowrap">
                            {p.averageStars != null ? p.averageStars.toFixed(1) : "—"} · {p.ratingCount}{" "}
                            {p.ratingCount === 1 ? "valoración" : "valoraciones"}
                          </div>
                          <div className="flex items-center gap-0.5">
                            {ratingBusy ? (
                              <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
                            ) : (
                              [1, 2, 3, 4, 5].map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  title={
                                    user
                                      ? `Valorar con ${n} ${n === 1 ? "estrella" : "estrellas"}`
                                      : "Iniciá sesión para valorar"
                                  }
                                  disabled={!user}
                                  onMouseEnter={() => setStarHover({ pathId: p.id, stars: n })}
                                  onClick={() => setPathRating(p.id, n)}
                                  className="p-0.5 rounded disabled:opacity-40 text-amber-400 hover:text-amber-300"
                                >
                                  <Star
                                    className={`h-4 w-4 ${filledThrough >= n ? "fill-current" : "fill-none opacity-50"}`}
                                  />
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleComments("learning_path", p.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text-muted hover:text-text"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          Comentarios
                          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                        {justCloned?.kind === "paths" && justCloned.id === p.id ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" /> Copiado
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleClonePath(p.id)}
                          disabled={cloningId === p.id && cloneKind === "paths"}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-60"
                        >
                          {cloningId === p.id && cloneKind === "paths" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          Clonar
                        </button>
                      </div>
                    </div>
                    {expanded ? (
                      <div className="border-t border-border pt-3 space-y-3">
                        {commentsLoadingKey === key && !commentsByKey[key] ? (
                          <div className="flex items-center gap-2 text-xs text-text-muted">
                            <Loader2 className="h-4 w-4 animate-spin" /> Cargando comentarios…
                          </div>
                        ) : null}
                        <ul className="space-y-2 max-h-56 overflow-y-auto">
                          {comments.map((c) => (
                            <li
                              key={c.id}
                              className="rounded-md bg-surface/80 border border-border/60 px-3 py-2 text-sm"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-xs font-medium text-primary">{c.authorName}</span>
                                  <p className="text-text text-sm mt-0.5 whitespace-pre-wrap">{c.body}</p>
                                  <p className="text-[10px] text-text-muted mt-1">
                                    {new Date(c.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                {user?.id === c.authorId ? (
                                  <button
                                    type="button"
                                    title="Borrar"
                                    onClick={() => removeComment("learning_path", p.id, c.id)}
                                    disabled={deletingCommentId === c.id}
                                    className="shrink-0 p-1 rounded text-text-muted hover:text-red-400 disabled:opacity-50"
                                  >
                                    {deletingCommentId === c.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </button>
                                ) : null}
                              </div>
                            </li>
                          ))}
                        </ul>
                        {user ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              rows={2}
                              placeholder="Sugerencia, duda o algo que agregarías al path…"
                              value={commentDraft[key] ?? ""}
                              onChange={(e) =>
                                setCommentDraft((d) => ({ ...d, [key]: e.target.value }))
                              }
                              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted resize-y min-h-[2.5rem]"
                            />
                            <button
                              type="button"
                              onClick={() => postComment("learning_path", p.id)}
                              disabled={postingKey === key || !(commentDraft[key] || "").trim()}
                              className="self-end inline-flex items-center gap-2 rounded-lg bg-primary/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary disabled:opacity-50"
                            >
                              {postingKey === key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                              Publicar
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-text-muted">
                            <Link href="/" className="text-primary hover:underline">
                              Iniciá sesión
                            </Link>{" "}
                            para comentar.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-text flex items-center gap-2 mb-4">
            <HelpCircle className="h-4 w-4 text-primary" />
            Preguntas públicas
          </h2>
          {questions.length === 0 ? (
            <p className="text-center py-10 text-text-muted text-sm">
              Todavía no hay preguntas públicas. Marcá una como visible desde{" "}
              <Link href="/questions" className="text-primary hover:underline">
                Preguntas
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-3">
              {questions.map((q) => {
                const key = resourceKey("question", q.id);
                const expanded = expandedKey === key;
                const comments = commentsByKey[key] ?? [];
                const likeBusy = likingKey === key;
                return (
                  <li
                    key={q.id}
                    className="rounded-lg border border-border bg-background/50 px-4 py-3 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="font-medium text-text text-sm leading-snug">{q.question}</p>
                        <p className="text-xs text-text-muted line-clamp-3 whitespace-pre-wrap">
                          {q.answerPreview}
                        </p>
                        <p className="text-[11px] text-text-muted">Por {q.authorName}</p>
                        {(q.tags || []).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {q.tags.map((t) => (
                              <span
                                key={t}
                                className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0 sm:ml-auto">
                        <button
                          type="button"
                          title={user ? (q.likedByMe ? "Quitar me gusta" : "Me gusta") : "Iniciá sesión para valorar"}
                          onClick={() => toggleLikeQuestion(q.id)}
                          disabled={!user || likeBusy}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                            q.likedByMe
                              ? "border-primary/50 bg-primary/15 text-primary"
                              : "border-border bg-surface text-text-muted hover:text-text"
                          } disabled:opacity-50`}
                        >
                          {likeBusy ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Heart className={`h-3.5 w-3.5 ${q.likedByMe ? "fill-current" : ""}`} />
                          )}
                          {q.likeCount ?? 0}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleComments("question", q.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text-muted hover:text-text"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          Comentarios
                          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                        {justCloned?.kind === "questions" && justCloned.id === q.id ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" /> Copiado
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleCloneQuestion(q.id)}
                          disabled={cloningId === q.id && cloneKind === "questions"}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-60"
                        >
                          {cloningId === q.id && cloneKind === "questions" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          Clonar
                        </button>
                      </div>
                    </div>
                    {expanded ? (
                      <div className="border-t border-border pt-3 space-y-3">
                        {commentsLoadingKey === key && !commentsByKey[key] ? (
                          <div className="flex items-center gap-2 text-xs text-text-muted">
                            <Loader2 className="h-4 w-4 animate-spin" /> Cargando comentarios…
                          </div>
                        ) : null}
                        <ul className="space-y-2 max-h-56 overflow-y-auto">
                          {comments.map((c) => (
                            <li
                              key={c.id}
                              className="rounded-md bg-surface/80 border border-border/60 px-3 py-2 text-sm"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-xs font-medium text-primary">{c.authorName}</span>
                                  <p className="text-text text-sm mt-0.5 whitespace-pre-wrap">{c.body}</p>
                                  <p className="text-[10px] text-text-muted mt-1">
                                    {new Date(c.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                {user?.id === c.authorId ? (
                                  <button
                                    type="button"
                                    title="Borrar"
                                    onClick={() => removeComment("question", q.id, c.id)}
                                    disabled={deletingCommentId === c.id}
                                    className="shrink-0 p-1 rounded text-text-muted hover:text-red-400 disabled:opacity-50"
                                  >
                                    {deletingCommentId === c.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </button>
                                ) : null}
                              </div>
                            </li>
                          ))}
                        </ul>
                        {user ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              rows={2}
                              placeholder="Corrección a la respuesta, enlace útil o pregunta…"
                              value={commentDraft[key] ?? ""}
                              onChange={(e) =>
                                setCommentDraft((d) => ({ ...d, [key]: e.target.value }))
                              }
                              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted resize-y min-h-[2.5rem]"
                            />
                            <button
                              type="button"
                              onClick={() => postComment("question", q.id)}
                              disabled={postingKey === key || !(commentDraft[key] || "").trim()}
                              className="self-end inline-flex items-center gap-2 rounded-lg bg-primary/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary disabled:opacity-50"
                            >
                              {postingKey === key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                              Publicar
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-text-muted">
                            <Link href="/" className="text-primary hover:underline">
                              Iniciá sesión
                            </Link>{" "}
                            para comentar.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/learning" className="inline-flex items-center gap-2 text-primary hover:underline">
          Mis Learning Paths <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/questions" className="inline-flex items-center gap-2 text-primary hover:underline">
          Mis Preguntas <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
