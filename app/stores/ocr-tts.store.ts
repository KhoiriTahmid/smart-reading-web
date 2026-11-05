import { create } from "zustand";
import { CustomApiError } from "~/lib/api-client";
import {
  createOcrTtsJob,
  getOcrTtsJob,
  retryOcrTtsJob,
} from "~/services/ocr-tts.service";
import type {
  OcrLang,
  ReadingHistoryResponse,
  ReadingJobStatus,
  TtsVoice,
} from "~/types/domain";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB (matches NestJS & FastAPI limit)
const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg"]);
const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 160; // ~4 minutes max
const SESSION_STORAGE_KEY = "smart-reading:ocr-tts-state";

export type Phase = "idle" | "running" | "done" | "error";
export type OcrError = "tooBig" | "badType" | "failed";

export interface FileMeta {
  name: string;
  size: number;
}

const STATUS_PROGRESS: Record<ReadingJobStatus, number> = {
  PENDING: 15,
  OCR_PROCESSING: 40,
  OCR_DONE: 65,
  TTS_PROCESSING: 80,
  COMPLETED: 100,
  FAILED: 0,
};

interface PersistedSessionState {
  fileMeta: FileMeta | null;
  lang: OcrLang;
  voice: TtsVoice;
  phase: Phase;
  jobStatus: ReadingJobStatus | null;
  historyId: string | null;
  progress: number;
  text: string;
  audioUrl: string;
  remark: string | null;
  error: OcrError | null;
  errorMessage: string | null;
}

export interface OcrTtsStore extends PersistedSessionState {
  file: File | null;
  sent: boolean;
  setLang: (lang: OcrLang) => void;
  setVoice: (voice: TtsVoice) => void;
  setSent: (sent: boolean) => void;
  setText: (text: string) => void;
  pick: (f: File) => void;
  convert: (lang?: OcrLang, voice?: TtsVoice) => Promise<void>;
  retry: () => Promise<void>;
  resumeIfNeeded: () => void;
  reset: () => void;
}

let pollTimer: ReturnType<typeof setTimeout> | null = null;
let activeRunId = 0;
let isPollingActive = false;

function stopPolling() {
  activeRunId += 1;
  isPollingActive = false;
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
}

function loadSessionState(): Partial<PersistedSessionState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<PersistedSessionState>;
  } catch {
    return {};
  }
}

function saveSessionState(state: OcrTtsStore) {
  if (typeof window === "undefined") return;
  try {
    const payload: PersistedSessionState = {
      fileMeta: state.fileMeta,
      lang: state.lang,
      voice: state.voice,
      phase: state.phase,
      jobStatus: state.jobStatus,
      historyId: state.historyId,
      progress: state.progress,
      text: state.text,
      audioUrl: state.audioUrl,
      remark: state.remark,
      error: state.error,
      errorMessage: state.errorMessage,
    };
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors
  }
}

const initialPersisted = loadSessionState();

export const useOcrTtsStore = create<OcrTtsStore>((set, get) => {
  const updateState = (partial: Partial<OcrTtsStore>) => {
    set((prev) => {
      const next = { ...prev, ...partial };
      saveSessionState(next);
      return partial;
    });
  };

  const applyJobState = (
    job: ReadingHistoryResponse,
    runId: number,
    attempt: number,
  ) => {
    if (runId !== activeRunId) return;

    const patch: Partial<OcrTtsStore> = {
      historyId: job.historyId,
      jobStatus: job.status,
    };

    if (!get().fileMeta && job.name) {
      patch.fileMeta = { name: job.name, size: 0 };
    }
    if (job.extractedText) {
      patch.text = job.extractedText;
    }
    if (job.remark) {
      patch.remark = job.remark;
    }

    if (job.status === "COMPLETED") {
      isPollingActive = false;
      updateState({
        ...patch,
        audioUrl: job.audioUrl ?? "",
        progress: 100,
        phase: "done",
        error: null,
        errorMessage: null,
      });
      return;
    }

    if (job.status === "FAILED") {
      isPollingActive = false;
      updateState({
        ...patch,
        progress: 0,
        error: "failed",
        errorMessage: job.errorMessage ?? null,
        phase: "error",
      });
      return;
    }

    const baseProgress = STATUS_PROGRESS[job.status] ?? 20;
    const creep = Math.min(attempt, 12);
    updateState({
      ...patch,
      phase: "running",
      progress: Math.min(baseProgress + creep, 95),
    });

    if (attempt >= MAX_POLL_ATTEMPTS) {
      isPollingActive = false;
      updateState({
        progress: 0,
        error: "failed",
        errorMessage: "Timed out waiting for OCR/TTS processing",
        phase: "error",
      });
      return;
    }

    isPollingActive = true;
    pollTimer = setTimeout(async () => {
      try {
        const updated = await getOcrTtsJob(job.historyId);
        applyJobState(updated, runId, attempt + 1);
      } catch (err) {
        if (runId !== activeRunId) return;
        isPollingActive = false;
        updateState({
          progress: 0,
          error: "failed",
          errorMessage: err instanceof CustomApiError ? err.message : null,
          phase: "error",
        });
      }
    }, POLL_INTERVAL_MS);
  };

  return {
    file: null,
    fileMeta: initialPersisted.fileMeta ?? null,
    lang: initialPersisted.lang ?? "id",
    voice: initialPersisted.voice ?? "female",
    sent: false,
    phase: initialPersisted.phase ?? "idle",
    jobStatus: initialPersisted.jobStatus ?? null,
    historyId: initialPersisted.historyId ?? null,
    progress: initialPersisted.progress ?? 0,
    text: initialPersisted.text ?? "",
    audioUrl: initialPersisted.audioUrl ?? "",
    remark: initialPersisted.remark ?? null,
    error: initialPersisted.error ?? null,
    errorMessage: initialPersisted.errorMessage ?? null,

    setLang: (lang) => updateState({ lang }),
    setVoice: (voice) => updateState({ voice }),
    setSent: (sent) => set({ sent }),
    setText: (text) => updateState({ text, sent: false }),

    pick: (f: File) => {
      stopPolling();
      if (f.size > MAX_BYTES) {
        updateState({
          error: "tooBig",
          errorMessage: null,
        });
        return;
      }
      if (!ALLOWED_MIME_TYPES.has(f.type)) {
        updateState({
          error: "badType",
          errorMessage: null,
        });
        return;
      }
      updateState({
        error: null,
        errorMessage: null,
        file: f,
        fileMeta: { name: f.name, size: f.size },
        phase: "idle",
        jobStatus: null,
        historyId: null,
        progress: 0,
        text: "",
        audioUrl: "",
        remark: null,
        sent: false,
      });
    },

    convert: async (langArg?: OcrLang, voiceArg?: TtsVoice) => {
      const { file, lang: stateLang, voice: stateVoice } = get();
      if (!file) return;
      const chosenLang = langArg ?? stateLang;
      const chosenVoice = voiceArg ?? stateVoice;

      stopPolling();
      const runId = activeRunId;
      isPollingActive = true;

      updateState({
        lang: chosenLang,
        voice: chosenVoice,
        error: null,
        errorMessage: null,
        remark: null,
        audioUrl: "",
        progress: 8,
        jobStatus: "PENDING",
        phase: "running",
        sent: false,
      });

      try {
        const created = await createOcrTtsJob(
          file,
          chosenVoice,
          file.name,
          chosenLang,
        );
        applyJobState(created, runId, 0);
      } catch (err) {
        if (runId !== activeRunId) return;
        isPollingActive = false;
        updateState({
          progress: 0,
          error: "failed",
          errorMessage: err instanceof CustomApiError ? err.message : null,
          phase: "error",
        });
      }
    },

    retry: async () => {
      const { historyId } = get();
      if (!historyId) return;
      stopPolling();
      const runId = activeRunId;
      isPollingActive = true;

      updateState({
        error: null,
        errorMessage: null,
        progress: 10,
        jobStatus: "PENDING",
        phase: "running",
      });

      try {
        const retried = await retryOcrTtsJob(historyId);
        applyJobState(retried, runId, 0);
      } catch (err) {
        if (runId !== activeRunId) return;
        isPollingActive = false;
        updateState({
          progress: 0,
          error: "failed",
          errorMessage: err instanceof CustomApiError ? err.message : null,
          phase: "error",
        });
      }
    },

    resumeIfNeeded: () => {
      const { phase, historyId } = get();
      if (phase === "running" && historyId && !isPollingActive) {
        const runId = activeRunId;
        isPollingActive = true;
        void (async () => {
          try {
            const current = await getOcrTtsJob(historyId);
            applyJobState(current, runId, 1);
          } catch (err) {
            if (runId !== activeRunId) return;
            isPollingActive = false;
            updateState({
              progress: 0,
              error: "failed",
              errorMessage: err instanceof CustomApiError ? err.message : null,
              phase: "error",
            });
          }
        })();
      }
    },

    reset: () => {
      stopPolling();
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
      set({
        file: null,
        fileMeta: null,
        lang: "id",
        voice: "female",
        sent: false,
        phase: "idle",
        jobStatus: null,
        historyId: null,
        progress: 0,
        text: "",
        audioUrl: "",
        remark: null,
        error: null,
        errorMessage: null,
      });
    },
  };
});
