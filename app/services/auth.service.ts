import { API_BASE_URL, apiFetch } from "~/lib/api-client";
import type {
  AuthTokens,
  AuthUser,
  LoginInput,
  MessageResponse,
  RegisterInput,
  ResetPasswordInput,
} from "~/types/auth";

const AUTH_PATHS = {
  login: "/auth/signin-by-email",
  register: "/auth/signup-by-email",
  resendVerification: "/auth/resend-verification",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
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

export async function registerByEmail(
  input: RegisterInput,
): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(AUTH_PATHS.register, json(input));
}

export async function resendVerificationEmail(
  email: string,
): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(
    AUTH_PATHS.resendVerification,
    json({ email }),
  );
}

export async function forgotPassword(email: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(AUTH_PATHS.forgotPassword, json({ email }));
}

export async function resetPassword(
  input: ResetPasswordInput,
): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(AUTH_PATHS.resetPassword, json(input));
}

export async function logout(): Promise<void> {
  await apiFetch<{ ok: boolean }>(`${AUTH_PATHS.logout}?isRedirect=false`);
}

export function startGoogleAuth(): void {
  window.location.assign(`${API_BASE_URL}${AUTH_PATHS.google}`);
}

