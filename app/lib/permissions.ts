import type { AuthUser } from "~/types/auth";

export const NAV_ROUTE_PERMISSIONS: Record<string, readonly string[]> = {
  "/": ["DASHBOARD"],
  "/ocr-tts": [
    "OCR.LIST",
    "OCR.CREATE",
    "OCR.DETAIL",
    "OCR.UPDATE",
    "TTS.LIST",
    "TTS.CREATE",
    "TTS.DETAIL",
    "TTS.UPDATE",
  ],
  "/history": [
    "READING_HISTORY.LIST",
    "READING_HISTORY.DETAIL",
    "READING_HISTORY.CREATE",
    "READING_HISTORY.UPDATE",
    "READING_HISTORY.DELETE",
  ],
  "/users": [
    "USER.LIST",
    "USER.DETAIL",
    "USER.CREATE",
    "USER.UPDATE",
    "USER.DELETE",
  ],
  "/roles": [
    "ROLE.LIST",
    "ROLE.DETAIL",
    "ROLE.CREATE",
    "ROLE.UPDATE",
    "ROLE.DELETE",
  ],
};

export const ORDERED_NAV_ROUTES = [
  "/",
  "/ocr-tts",
  "/history",
  "/users",
  "/roles",
] as const;

export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/" || pathname === "/dashboard") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function isKnownAppRoute(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return Object.prototype.hasOwnProperty.call(
    NAV_ROUTE_PERMISSIONS,
    normalized,
  );
}

export function hasAnyPermission(
  user: AuthUser | null | undefined,
  requiredPermissions: readonly string[],
): boolean {
  const perms = user?.role?.permissions;
  if (!perms) return false;
  if (Boolean(perms.FULL_ACCESS)) return true;
  return requiredPermissions.some((key) => Boolean(perms[key]));
}

export function canAccessRoute(
  user: AuthUser | null | undefined,
  pathname: string,
): boolean {
  const normalized = normalizePathname(pathname);
  const required = NAV_ROUTE_PERMISSIONS[normalized];
  if (!required) return false;
  return hasAnyPermission(user, required);
}

export function getFirstAccessibleRoute(
  user: AuthUser | null | undefined,
): string | null {
  for (const routePath of ORDERED_NAV_ROUTES) {
    if (canAccessRoute(user, routePath)) {
      return routePath;
    }
  }
  return null;
}
