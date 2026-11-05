import { API_BASE_URL, apiFetch } from "~/lib/api-client";
import type {
  AuthTokens,
  AuthUser,
  LoginInput,
  RegisterInput,
} from "~/types/auth";

const AUTH_PATHS = {
  login: "/auth/signin-by-email",
  register: "/auth/signup-by-email",
  google: "/auth/signin-by-google",
  me: "/auth/me",
  logout: "/auth/logout",
} as const;

const json = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export async function getCurrentUser(): Promise<AuthUser> {
  return apiFetch<AuthUser>(AUTH_PATHS.me);
}

export async function loginByEmail(input: LoginInput): Promise<AuthUser> {
  await apiFetch<AuthTokens>(
    `${AUTH_PATHS.login}?isRedirect=false`,
    json(input),
  );

  return getCurrentUser();
}

export async function registerByEmail(input: RegisterInput): Promise<AuthUser> {
  await apiFetch<AuthTokens>(AUTH_PATHS.register, json(input));

  return getCurrentUser();
}

export async function logout(): Promise<void> {
  await apiFetch<{ ok: boolean }>(`${AUTH_PATHS.logout}?isRedirect=false`);
}

export function startGoogleAuth(): void {
  window.location.assign(`${API_BASE_URL}${AUTH_PATHS.google}`);
}
