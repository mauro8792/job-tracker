"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiStore } from "@/lib/api-store";
import { AppSectionIntro } from "@/components/SectionIntroModal";
import { useAuth } from "@/lib/auth";
import { FeedPost, CommunityComment } from "@/lib/types";
import {
  Newspaper,
  Loader2,
  Heart,
  MessageCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Send,
  Briefcase,
  BookOpen,
} from "lucide-react";

type Tab = "story" | "opportunity";

function feedResourceKey(id: string) {
  return `feed_post:${id}`;
}

function authorDisplayName(
  user: { firstName: string; lastName: string; email: string } | null,
): string {
  if (!user) return "Usuario";
  const n = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  if (n) return n;
  const local = user.email?.split("@")[0];
  return local || "Usuario";
}

export default function FeedPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("story");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [likingId, setLikingId] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [commentsByKey, setCommentsByKey] = useState<Record<string, CommunityComment[]>>({});
  const [commentsLoadingKey, setCommentsLoadingKey] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [postingKey, setPostingKey] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    apiStore
      .getFeedPosts(tab)
      .then(setPosts)
      .catch((e) => {
        setError(e instanceof Error ? e.message : "No se pudo cargar el feed");
      })
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const parseTags = (raw: string): string[] => {
    return raw
      .split(/[,#]/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 8);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const t = title.trim();
    const b = body.trim();
    if (t.length < 3 || b.length < 10) {
      setError("Título (mín. 3) y texto (mín. 10 caracteres).");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await apiStore.createFeedPost({
        kind: tab,
        title: t,
        body: b,
        tags: parseTags(tagsRaw),
      });
      const name = authorDisplayName(user);
      const merged: FeedPost = {
        ...created,
        authorName: name,
        createdAt:
          typeof created.createdAt === "string" ? created.createdAt : new Date().toISOString(),
        updatedAt:
          typeof created.updatedAt === "string" ? created.updatedAt : new Date().toISOString(),
      };
      setPosts((prev) => [merged, ...prev]);
      setTitle("");
      setBody("");
      setTagsRaw("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (id: string) => {
    if (!user) return;
    setLikingId(id);
    try {
      const { liked, likeCount } = await apiStore.toggleCommunityLike("feed_post", id);
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, likedByMe: liked, likeCount } : p)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar el like");
    } finally {
      setLikingId(null);
    }
  };

  const fetchComments = async (id: string) => {
    const key = feedResourceKey(id);
    setCommentsLoadingKey(key);
    try {
      const list = await apiStore.getCommunityComments("feed_post", id);
      setCommentsByKey((prev) => ({ ...prev, [key]: list }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los comentarios");
    } finally {
      setCommentsLoadingKey(null);
    }
  };

  const toggleComments = (id: string) => {
    const key = feedResourceKey(id);
    if (expandedKey === key) {
      setExpandedKey(null);
      return;
    }
    setExpandedKey(key);
    if (!commentsByKey[key]) void fetchComments(id);
  };

  const postComment = async (id: string) => {
    if (!user) return;
    const key = feedResourceKey(id);
    const text = (commentDraft[key] || "").trim();
    if (!text) return;
    setPostingKey(key);
    try {
      await apiStore.postCommunityComment("feed_post", id, text);
      setCommentDraft((d) => ({ ...d, [key]: "" }));
      await fetchComments(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo publicar el comentario");
    } finally {
      setPostingKey(null);
    }
  };

  const removeComment = async (postId: string, commentId: string) => {
    setDeletingCommentId(commentId);
    try {
      await apiStore.deleteCommunityComment(commentId);
      await fetchComments(postId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo borrar el comentario");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const removePost = async (id: string) => {
    setDeletingPostId(id);
    try {
      await apiStore.deleteFeedPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setExpandedKey(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo borrar la publicación");
    } finally {
      setDeletingPostId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <AppSectionIntro sectionId="feed" />
      <div>
        <div className="flex items-center gap-2 text-primary mb-1">
          <Newspaper className="h-6 w-6" />
          <span className="text-xs font-semibold uppercase tracking-wide">Fase 3 — Feed &amp; bolsa</span>
        </div>
        <h1 className="text-2xl font-bold text-text">Feed &amp; bolsa</h1>
        <p className="text-text-muted text-sm mt-1 max-w-2xl">
          Compartí experiencias de entrevistas, tips o buscá/avisá oportunidades (referidos, freelance, vacantes).
          También podés ir a{" "}
          <Link href="/community" className="text-primary hover:underline">
            Comunidad
          </Link>{" "}
          para paths y preguntas públicas.
        </p>
      </div>

      <div className="flex gap-2 border-b border-border pb-px">
        <button
          type="button"
          onClick={() => setTab("story")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
            tab === "story"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Historias &amp; tips
        </button>
        <button
          type="button"
          onClick={() => setTab("opportunity")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
            tab === "opportunity"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          Bolsa
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
          {error}
        </div>
      ) : null}

      {user ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-surface p-4 space-y-3"
        >
          <p className="text-sm font-medium text-text">
            Nueva publicación en: {tab === "story" ? "Historias & tips" : "Bolsa"}
          </p>
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted"
          />
          <textarea
            rows={4}
            placeholder={
              tab === "story"
                ? "Contá tu experiencia, qué preguntaron, qué aprendiste…"
                : "Detalle del rol, stack, cómo aplicar o contacto…"
            }
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted resize-y min-h-[6rem]"
          />
          <input
            type="text"
            placeholder="Etiquetas opcionales (separadas por coma)"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-text placeholder:text-text-muted"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Publicar
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-text-muted rounded-xl border border-border bg-surface">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando…
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 px-6 py-12 text-center text-sm text-text-muted">
          Todavía no hay publicaciones en esta pestaña. ¡Sé el primero!
        </div>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => {
            const key = feedResourceKey(p.id);
            const expanded = expandedKey === key;
            const comments = commentsByKey[key] ?? [];
            const likeBusy = likingId === p.id;
            const mine = user?.id === p.authorId;
            return (
              <li
                key={p.id}
                className="rounded-xl border border-border bg-surface p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-text leading-snug">{p.title}</p>
                    <p className="text-xs text-text-muted mt-1">
                      Por {p.authorName} ·{" "}
                      {new Date(p.createdAt).toLocaleString("es-AR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  {mine ? (
                    <button
                      type="button"
                      title="Borrar publicación"
                      onClick={() => removePost(p.id)}
                      disabled={deletingPostId === p.id}
                      className="shrink-0 p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {deletingPostId === p.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  ) : null}
                </div>
                <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">{p.body}</p>
                {(p.tags || []).length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
                  <button
                    type="button"
                    title={user ? (p.likedByMe ? "Quitar me gusta" : "Me gusta") : "Iniciá sesión"}
                    onClick={() => toggleLike(p.id)}
                    disabled={!user || likeBusy}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      p.likedByMe
                        ? "border-primary/50 bg-primary/15 text-primary"
                        : "border-border bg-background/50 text-text-muted hover:text-text"
                    } disabled:opacity-50`}
                  >
                    {likeBusy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Heart className={`h-3.5 w-3.5 ${p.likedByMe ? "fill-current" : ""}`} />
                    )}
                    {p.likeCount ?? 0}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleComments(p.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/50 px-2.5 py-1.5 text-xs font-medium text-text-muted hover:text-text"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Comentarios
                    {expanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                {expanded ? (
                  <div className="space-y-3 pt-2">
                    {commentsLoadingKey === key && !commentsByKey[key] ? (
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
                      </div>
                    ) : null}
                    <ul className="space-y-2 max-h-52 overflow-y-auto">
                      {comments.map((c) => (
                        <li
                          key={c.id}
                          className="rounded-md bg-background/60 border border-border/60 px-3 py-2 text-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-xs font-medium text-primary">{c.authorName}</span>
                              <p className="text-text text-sm mt-0.5 whitespace-pre-wrap">{c.body}</p>
                              <p className="text-[10px] text-text-muted mt-1">
                                {new Date(c.createdAt).toLocaleString("es-AR")}
                              </p>
                            </div>
                            {user?.id === c.authorId ? (
                              <button
                                type="button"
                                title="Borrar"
                                onClick={() => removeComment(p.id, c.id)}
                                disabled={deletingCommentId === c.id}
                                className="shrink-0 p-1 rounded text-text-muted hover:text-red-400"
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
                          placeholder="Comentario o pregunta…"
                          value={commentDraft[key] ?? ""}
                          onChange={(e) =>
                            setCommentDraft((d) => ({ ...d, [key]: e.target.value }))
                          }
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted resize-y"
                        />
                        <button
                          type="button"
                          onClick={() => postComment(p.id)}
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
  );
}
