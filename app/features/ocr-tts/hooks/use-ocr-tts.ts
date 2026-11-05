import { useEffect } from "react";
import {
  useOcrTtsStore,
  type FileMeta,
  type OcrError,
  type Phase,
} from "~/stores/ocr-tts.store";

export type { FileMeta, OcrError, Phase };

export function useOcrTts() {
  const store = useOcrTtsStore();

  useEffect(() => {
    store.resumeIfNeeded();
  }, []);

  return store;
}
