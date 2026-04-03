"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("djt_access_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("djt_refresh_token");
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("djt_access_token", accessToken);
  localStorage.setItem("djt_refresh_token", refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("djt_access_token");
  localStorage.removeItem("djt_refresh_token");
  localStorage.removeItem("djt_user");
}

/** Claves `djt_*` de datos viejos (store local); no incluye auth ni migración CV/CL pendiente. */
const LEGACY_DJT_DATA_KEYS = [
  "djt_applications",
  "djt_platforms",
  "djt_checklist",
  "djt_progress",
  "djt_onboarded",
  "djt_templates",
  "djt_questions",
  "djt_learning_paths",
  "djt_testimonials",
  "djt_pitch_data",
] as const;

/** Elimina persistencia local obsoleta; los tokens y `djt_user` se conservan. */
export function clearLegacyDjtLocalStorage(): void {
  if (typeof window === "undefined") return;
  for (const key of LEGACY_DJT_DATA_KEYS) {
    localStorage.removeItem(key);
  }
}

type ProfileLike = {
  cv?: unknown;
  coverLetter?: { text?: string; pdf?: unknown } | null;
};

/** Si el perfil ya tiene CV/CL en servidor, borra copias locales redundantes. */
export function stripLocalCvClIfSynced(profile: ProfileLike): void {
  if (typeof window === "undefined") return;
  if (profile.cv) localStorage.removeItem("djt_cv_file");
  const cl = profile.coverLetter;
  if (cl?.pdf || (typeof cl?.text === "string" && cl.text.length > 0)) {
    localStorage.removeItem("djt_cover_letter");
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();
    const tokens = data.data ?? data;
    setTokens(tokens.accessToken, tokens.refreshToken);
    return tokens.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let token = getAccessToken();

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const doFetch = (accessToken: string | null) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(!isFormData ? { "Content-Type": "application/json" } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
    });

  let res = await doFetch(token);

  if (res.status === 401) {
    token = await refreshAccessToken();
    if (token) {
      res = await doFetch(token);
    } else {
      clearTokens();
      window.location.href = "/";
      throw new Error("Session expired");
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message ?? `Error ${res.status}`);
  }

  const json = await res.json();
  return json.data ?? json;
}

export function getGoogleLoginUrl(): string {
  return `${API_URL}/auth/google`;
}
