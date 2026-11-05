import { CustomApiError } from "~/lib/api-client";

interface AuthErrorMessages {
  fallback: string;
  byStatus?: Partial<Record<number, string>>;
}

/**
 * Turns an API error into a localized message. Known statuses get a friendly
 * translation, other client errors use the backend message, and server errors
 * fall back to a generic message.
 */
export function getAuthErrorMessage(
  error: unknown,
  { fallback, byStatus = {} }: AuthErrorMessages,
): string {
  if (error instanceof CustomApiError) {
    const localized = byStatus[error.status];
    if (localized) return localized;
    if (error.status < 500 && error.message) return error.message;
  }

  return fallback;
}
