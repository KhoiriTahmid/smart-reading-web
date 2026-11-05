import {
  BookOpen,
  History,
  LayoutDashboard,
  Loader2,
  LogOut,
  ScanText,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router";
import { cn } from "~/lib/cn";
import { canAccessRoute } from "~/lib/permissions";
import { logout } from "~/services/auth.service";
import { useOcrTtsStore } from "~/stores/ocr-tts.store";
import type { AuthUser } from "~/types/auth";

const items = [
  { to: "/", key: "nav.dashboard", icon: LayoutDashboard },
  { to: "/ocr-tts", key: "nav.ocrTts", icon: ScanText },
  { to: "/history", key: "nav.history", icon: History },
  { to: "/users", key: "nav.users", icon: Users },
  { to: "/roles", key: "nav.roles", icon: ShieldCheck },
] as const;

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function Sidebar({ user }: { user: AuthUser }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const resetOcrStore = useOcrTtsStore((s) => s.reset);
  const visibleItems = items.filter((item) => canAccessRoute(user, item.to));

  const avatar = user.picture ? (
    <img
      src={user.picture}
      alt=""
      className="size-8 shrink-0 rounded-full object-cover"
    />
  ) : (
    <div className="bg-infobg text-info grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold">
      {initials(user.name)}
    </div>
  );

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      await logout();
    } catch {
      // The session may already be expired; still return to the login page.
    } finally {
      resetOcrStore();
      navigate("/login", { replace: true });
    }
  };

  return (
    <aside className="border-line bg-card flex w-16 shrink-0 flex-col gap-1.5 border-r px-2 py-4 md:w-60 md:px-3.5 md:py-5">
      <div className="flex items-center justify-center gap-2.5 pb-4 md:justify-start md:px-2 md:h-[80px]">
        <div className="bg-ink text-bg grid size-9 shrink-0 place-items-center rounded-xl">
          <BookOpen className="size-[18px]" />
        </div>
        <span className="hidden text-[15px] font-bold md:block">
          Smart Reading
        </span>
      </div>

      <nav className="flex flex-col gap-1.5">
        {visibleItems.map(({ to, key, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            title={t(key)}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors md:justify-start",
                isActive
                  ? "bg-accbg text-acc font-semibold"
                  : "text-mute hover:bg-soft hover:text-ink",
              )
            }
          >
            <Icon className="size-[18px] shrink-0" />
            <span className="hidden md:block">{t(key)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="border-line border-t pt-3">
        <div className="flex flex-col items-center gap-2 md:hidden">
          {avatar}
        </div>

        <div className="hidden items-center gap-2.5 md:flex md:px-1">
          {avatar}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{user.name}</p>
            <p className="text-mute truncate text-xs">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            title={t("auth.logout")}
            aria-label={t("auth.logout")}
            className="text-mute hover:bg-soft hover:text-ink grid size-8 shrink-0 place-items-center rounded-lg transition-colors disabled:opacity-50"
          >
            {loggingOut ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          title={t("auth.logout")}
          aria-label={t("auth.logout")}
          className="text-mute hover:bg-soft hover:text-ink mt-2 flex w-full items-center justify-center rounded-lg py-2 transition-colors disabled:opacity-50 md:hidden"
        >
          {loggingOut ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
