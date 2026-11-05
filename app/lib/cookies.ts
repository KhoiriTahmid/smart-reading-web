import Cookies from "js-cookie";

export function getCookie(key: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return Cookies.get(key);
}

export function setCookie(
  key: string,
  value: string,
  options?: Cookies.CookieAttributes,
): void {
  if (typeof document === "undefined") return;
  Cookies.set(key, value, { expires: 365, sameSite: "lax", ...options });
}

export function removeCookie(key: string): void {
  if (typeof document === "undefined") return;
  Cookies.remove(key);
}
