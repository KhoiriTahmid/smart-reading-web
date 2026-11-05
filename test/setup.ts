import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import i18n from "~/i18n";

// Assert against English copy regardless of the developer's cookie.
void i18n.changeLanguage("en");

if (typeof window !== "undefined") {
  window.speechSynthesis = {
    cancel: () => {},
    speak: () => {},
    pause: () => {},
    resume: () => {},
    getVoices: () => [],
  } as unknown as SpeechSynthesis;
}

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
});
