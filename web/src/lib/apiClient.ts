/**
 * The one place this SPA talks to its API.
 *
 * Token model:
 *   - access token  — short-lived, kept in memory *and* mirrored to
 *     localStorage so a page reload does not flash the login screen. Sent as
 *     `Authorization: Bearer`.
 *   - refresh token — never visible to this code at all. It lives in an
 *     httpOnly cookie that only `/auth/*` receives, which is why every call
 *     here uses `credentials: "include"`.
 *
 * On a 401 the client refreshes **once** and replays the original request. If
 * ten requests fail at the same moment they all wait on the *same* refresh
 * promise, so the refresh token is rotated once, not ten times — rotating it
 * concurrently would look like token reuse and log the user out.
 */
import { clearPretaCookie, setPretaCookie } from "@/lib/preta";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5003";

const ACCESS_TOKEN_KEY = "deskdesk_access_token";

let accessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;
let onSessionLost: (() => void) | null = null;

export function loadStoredToken(): string | null {
  if (accessToken) return accessToken;
  try {
    accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    accessToken = null;
  }
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  try {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // Private mode / storage disabled — the in-memory copy still works for
    // this tab, we just lose persistence across reloads.
  }
}

/** Called when refreshing fails, so the app can drop to the login screen. */
export function setSessionLostHandler(handler: (() => void) | null): void {
  onSessionLost = handler;
}

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; code: string; message: string; fields?: Record<string, string> };

type ErrorBody = { error?: { code?: string; message?: string; fields?: Record<string, string> } };

async function toResult<T>(response: Response): Promise<ApiResult<T>> {
  const body = await response.json().catch(() => null);
  if (response.ok) return { ok: true, status: response.status, data: body as T };
  const error = (body as ErrorBody | null)?.error;
  return {
    ok: false,
    status: response.status,
    code: error?.code ?? "request_failed",
    message: error?.message ?? "Request failed.",
    fields: error?.fields,
  };
}

async function rawFetch(path: string, init: RequestInit, withAuth: boolean): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  const token = withAuth ? loadStoredToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    // Required for the refresh cookie on a cross-origin request.
    credentials: "include",
  });
}

/** Rotate the refresh token. Concurrent callers share one in-flight attempt. */
export function refreshSession(): Promise<boolean> {
  refreshPromise ??= (async () => {
    try {
      const response = await rawFetch("/auth/refresh", { method: "POST" }, false);
      if (!response.ok) {
        setAccessToken(null);
        clearPretaCookie();
        return false;
      }
      const body = (await response.json()) as { accessToken: string; pretaToken?: string | null };
      setAccessToken(body.accessToken);
      // The silent refresh doubles as the Preta cookie's refresh — nothing extra to
      // schedule, and the cookie can never outlive the session that produced it.
      setPretaCookie(body.pretaToken);
      return true;
    } catch {
      return false;
    } finally {
      // Clear on the next tick so everyone awaiting this attempt sees its result.
      queueMicrotask(() => {
        refreshPromise = null;
      });
    }
  })();

  return refreshPromise;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await rawFetch(path, init, true);
  } catch {
    return {
      ok: false,
      status: 503,
      code: "api_unreachable",
      message: `Could not reach the API at ${API_URL}. Is it running?`,
    };
  }

  if (response.status !== 401) return toResult<T>(response);

  // One silent refresh, then replay the original request exactly once.
  const refreshed = await refreshSession();
  if (!refreshed) {
    onSessionLost?.();
    return {
      ok: false,
      status: 401,
      code: "session_expired",
      message: "Your session has ended. Please sign in.",
    };
  }

  try {
    const retry = await rawFetch(path, init, true);
    return toResult<T>(retry);
  } catch {
    return {
      ok: false,
      status: 503,
      code: "api_unreachable",
      message: `Could not reach the API at ${API_URL}.`,
    };
  }
}

export { API_URL };
