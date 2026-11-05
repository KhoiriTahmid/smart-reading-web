import { useCallback, useEffect, useState } from "react";
import { getCookie, setCookie } from "~/lib/cookies";

export type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (getCookie("theme") as Theme) || "system";
  });

  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.removeAttribute("data-theme");
    }
  }, [theme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setCookie("theme", nextTheme);
    setThemeState(nextTheme);
  }, []);

  return { theme, setTheme };
}
