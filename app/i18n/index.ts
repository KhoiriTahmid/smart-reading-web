import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import idTranslation from "./locales/id.json";
import enTranslation from "./locales/en.json";
import { getCookie, setCookie } from "~/lib/cookies";
import { useCallback } from "react";

const initialLang = getCookie("lang") || "id";

i18n.use(initReactI18next).init({
  resources: {
    id: { translation: idTranslation },
    en: { translation: enTranslation },
  },
  lng: initialLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export function useLanguage() {
  const { i18n } = useTranslation();

  const setLang = useCallback(
    (lang: "id" | "en") => {
      setCookie("lang", lang);
      i18n.changeLanguage(lang);
    },
    [i18n],
  );

  return { lang: i18n.language as "id" | "en", setLang };
}

export default i18n;
