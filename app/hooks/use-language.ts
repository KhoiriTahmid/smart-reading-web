import Cookies from "js-cookie";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

export type Lang = "id" | "en";

/** Skip this file if you already have a useLanguage() with the same shape. */
export function useLanguage() {
  const { i18n } = useTranslation();
  const lang: Lang = i18n.language?.startsWith("en") ? "en" : "id";

  const setLang = useCallback(
    (next: Lang) => {
      Cookies.set("lang", next, { expires: 365, sameSite: "lax" });
      document.documentElement.lang = next;
      void i18n.changeLanguage(next);
    },
    [i18n],
  );

  return { lang, setLang };
}
