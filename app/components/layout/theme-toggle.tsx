import { Moon, Sun } from "lucide-react";
import { useTheme } from "~/hooks/use-theme";

/** Assumes useTheme() returns { setTheme(theme: "light" | "dark" | "system") }. */
export function ThemeToggle() {
  const { setTheme } = useTheme();

  const toggle = () => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="border-line text-mute hover:bg-soft hover:text-ink grid size-9 place-items-center rounded-lg border transition-colors"
    >
      <Moon className="size-4 dark:hidden" />
      <Sun className="hidden size-4 dark:block" />
    </button>
  );
}
