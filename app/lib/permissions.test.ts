import { describe, expect, it } from "vitest";
import type { AuthUser } from "~/types/auth";
import {
  canAccessRoute,
  getFirstAccessibleRoute,
  hasAnyPermission,
  isKnownAppRoute,
  normalizePathname,
} from "./permissions";

const userWith = (permissions?: Record<string, boolean>): AuthUser => ({
  userId: "u-1",
  name: "Test",
  email: "t@example.com",
  role: permissions
    ? { roleId: "r-1", name: "Role", permissions }
    : undefined,
});

describe("normalizePathname", () => {
  it.each([
    ["", "/"],
    ["/", "/"],
    ["/dashboard", "/"],
    ["/history/", "/history"],
    ["/users", "/users"],
  ])("%s -> %s", (input, expected) => {
    expect(normalizePathname(input)).toBe(expected);
  });
});

describe("isKnownAppRoute", () => {
  it("recognises app pages", () => {
    for (const path of ["/", "/ocr-tts", "/history", "/users", "/roles"]) {
      expect(isKnownAppRoute(path)).toBe(true);
    }
  });

  it("rejects unknown paths", () => {
    expect(isKnownAppRoute("/nope")).toBe(false);
    expect(isKnownAppRoute("/users/123")).toBe(false);
  });
});

describe("hasAnyPermission", () => {
  it("is false without a role or permissions", () => {
    expect(hasAnyPermission(null, ["DASHBOARD"])).toBe(false);
    expect(hasAnyPermission(userWith(), ["DASHBOARD"])).toBe(false);
  });

  it("FULL_ACCESS grants everything", () => {
    expect(hasAnyPermission(userWith({ FULL_ACCESS: true }), ["X"])).toBe(true);
  });

  it("ignores permissions explicitly set to false", () => {
    expect(
      hasAnyPermission(userWith({ "USER.LIST": false }), ["USER.LIST"]),
    ).toBe(false);
  });
});

describe("canAccessRoute", () => {
  const regularUser = userWith({
    DASHBOARD: true,
    "OCR.CREATE": true,
    "READING_HISTORY.LIST": true,
    "USER.LIST": false,
    "ROLE.LIST": false,
  });

  it("allows pages the role grants", () => {
    expect(canAccessRoute(regularUser, "/")).toBe(true);
    expect(canAccessRoute(regularUser, "/dashboard")).toBe(true);
    expect(canAccessRoute(regularUser, "/ocr-tts")).toBe(true);
    expect(canAccessRoute(regularUser, "/history")).toBe(true);
  });

  it("blocks admin pages for a regular user", () => {
    expect(canAccessRoute(regularUser, "/users")).toBe(false);
    expect(canAccessRoute(regularUser, "/roles")).toBe(false);
  });

  it("TTS-only permissions also unlock OCR to Speech", () => {
    expect(canAccessRoute(userWith({ "TTS.LIST": true }), "/ocr-tts")).toBe(
      true,
    );
  });

  it("never allows unknown routes, even with FULL_ACCESS", () => {
    expect(canAccessRoute(userWith({ FULL_ACCESS: true }), "/nope")).toBe(
      false,
    );
  });
});

describe("getFirstAccessibleRoute", () => {
  it("prefers the dashboard", () => {
    expect(getFirstAccessibleRoute(userWith({ FULL_ACCESS: true }))).toBe("/");
  });

  it("falls through to the first permitted page in nav order", () => {
    expect(
      getFirstAccessibleRoute(userWith({ "READING_HISTORY.LIST": true })),
    ).toBe("/history");
    expect(getFirstAccessibleRoute(userWith({ "ROLE.UPDATE": true }))).toBe(
      "/roles",
    );
  });

  it("returns null when nothing is permitted", () => {
    expect(getFirstAccessibleRoute(userWith({}))).toBeNull();
  });
});
