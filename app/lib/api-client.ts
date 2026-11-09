import type { ApiError } from "~/types/api";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export class CustomApiError extends Error implements ApiError {
  public status: number;
  public errors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "CustomApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface ApiEnvelope<T> {
  code: string;
  message: string;
  payload: T;
}

function isEnvelope<T>(body: unknown): body is ApiEnvelope<T> {
  return (
    typeof body === "object" &&
    body !== null &&
    "code" in body &&
    "payload" in body
  );
}

async function parseBody<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  if (!text) return undefined as T;

  const body = JSON.parse(text) as T | ApiEnvelope<T>;
  return isEnvelope<T>(body) ? body.payload : body;
}

let refreshRequest: Promise<boolean> | null = null;

/**
 * Rotate the auth cookies once. Concurrent 401s share the same request so the
 * refresh token is not consumed more than once.
 */
function refreshSession(): Promise<boolean> {
  if (!refreshRequest) {
    refreshRequest = fetch(`${API_BASE_URL}/auth/refresh?isRedirect=false`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

function canRefresh(path: string): boolean {
  return (
    !path.startsWith("/auth/signin-by-email") &&
    !path.startsWith("/auth/signup-by-email") &&
    !path.startsWith("/auth/resend-verification") &&
    !path.startsWith("/auth/forgot-password") &&
    !path.startsWith("/auth/reset-password") &&
    !path.startsWith("/auth/verify-email") &&
    !path.startsWith("/auth/refresh")
  );
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  retryOnUnauthorized = true,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const { headers, ...rest } = init ?? {};

  const res = await fetch(url, {
    credentials: "include",
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (
    res.status === 401 &&
    retryOnUnauthorized &&
    canRefresh(path) &&
    (await refreshSession())
  ) {
    return apiFetch<T>(path, init, false);
  }

  if (!res.ok) {
    let errBody: Partial<ApiError> = {};
    try {
      errBody = await res.json();
    } catch {
      // Body not JSON
    }

    throw new CustomApiError(
      errBody.message || res.statusText || "An API error occurred",
      res.status,
      errBody.errors,
    );
  }

  return parseBody<T>(res);
}

export async function apiFetchForm<T>(
  path: string,
  init?: RequestInit,
  retryOnUnauthorized = true,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
 const headers = new Headers(init?.headers);
  headers.delete("Content-Type");

  const res = await fetch(url, {
    credentials: "include",
    ...init,
    headers,
  });

  if (
    res.status === 401 &&
    retryOnUnauthorized &&
    canRefresh(path) &&
    (await refreshSession())
  ) {
    return apiFetchForm<T>(path, init, false);
  }

  if (!res.ok) {
    let errBody: Partial<ApiError> = {};
    try {
      errBody = await res.json();
    } catch {
      // Body not JSON
    }

    throw new CustomApiError(
      errBody.message || res.statusText || "An API error occurred",
      res.status,
      errBody.errors,
    );
  }

  return parseBody<T>(res);
}
