// app/services/ocr-tts.service.ts
import { apiFetch, apiFetchForm } from "~/lib/api-client";
import { delay, USE_MOCK } from "~/lib/env";
import type {
  OcrLang,
  ReadingHistoryResponse,
  TtsVoice,
} from "~/types/domain";
import { PATHS } from "./paths";

const SAMPLE = {
  id: "Bab satu. Sudah menjadi kebenaran umum bahwa seorang pria lajang yang berkecukupan pasti sedang mencari seorang istri.",
  en: "Chapter one. It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
};

export async function createOcrTtsJob(
  file: File,
  voice: TtsVoice,
  name?: string,
  lang: OcrLang = "id",
): Promise<ReadingHistoryResponse> {
  if (USE_MOCK) {
    await delay(1200);
    return {
      historyId: `mock-${Date.now()}`,
      name: name ?? file.name,
      extractedText: lang === "en" ? SAMPLE.en : SAMPLE.id,
      audioUrl: "",
      imageUrl: null,
      voice,
      status: "COMPLETED",
      remark: null,
      errorMessage: null,
      createdAt: new Date().toISOString(),
    };
  }

  const form = new FormData();
  form.append("file", file);
  form.append("voice", voice);
  form.append("lang", lang);
  if (name) form.append("name", name);

  return apiFetchForm<ReadingHistoryResponse>(PATHS.ocrTts, {
    method: "POST",
    body: form,
  });
}

export async function getOcrTtsJob(
  historyId: string,
): Promise<ReadingHistoryResponse> {
  return apiFetch<ReadingHistoryResponse>(`${PATHS.ocrTts}/${historyId}`);
}

export async function retryOcrTtsJob(
  historyId: string,
): Promise<ReadingHistoryResponse> {
  return apiFetch<ReadingHistoryResponse>(
    `${PATHS.ocrTts}/${historyId}/retry`,
    { method: "POST" },
  );
}
