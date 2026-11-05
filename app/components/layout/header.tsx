import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { Badge, type BadgeTone } from "~/components/ui/badge";
import {
  canAccessRoute,
  isKnownAppRoute,
  normalizePathname,
} from "~/lib/permissions";
import { useDeviceStore } from "~/stores/device.store";
import type { AuthUser } from "~/types/auth";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

const pageKeys: Record<string, string> = {
  "/": "dashboard",
  "/dashboard": "dashboard",
  "/history": "history",
  "/ocr-tts": "ocrTts",
  "/users": "users",
  "/roles": "roles",
};

const statusTone: Record<string, BadgeTone> = {
  open: "ok",
  connecting: "warn",
  closed: "bad",
};

export function Header({ user }: { user?: AuthUser }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const status = useDeviceStore((s) => s.status);
  const normalized = normalizePathname(pathname);
  const isAccessible =
    isKnownAppRoute(normalized) &&
    (!user || canAccessRoute(user, normalized));
  const page = isAccessible ? (pageKeys[normalized] ?? "dashboard") : "notFound";

  return (
    <header className="bg-bg border-line flex items-center justify-between gap-4 border-b px-6 py-6 md:px-8">
      <div className="min-w-0 flex flex-col gap-2">
        <h1 className="truncate text-2xl font-bold tracking-tight">
          {t(`pages.${page}.title`)}
        </h1>
        <p className="text-mute truncate text-xs">
          {t(`pages.${page}.subtitle`)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <Badge
          tone={statusTone[status] ?? "neutral"}
          className="hidden sm:inline-flex"
        >
          {t(`header.status.${status}`)}
        </Badge>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
