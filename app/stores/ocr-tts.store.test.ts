import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReadingHistoryResponse, ReadingJobStatus } from "~/types/domain";

vi.mock("~/services/ocr-tts.service", () => ({
  createOcrTtsJob: vi.fn(),
  getOcrTtsJob: vi.fn(),
  retryOcrTtsJob: vi.fn(),
}));

import {
  createOcrTtsJob,
  getOcrTtsJob,
  retryOcrTtsJob,
} from "~/services/ocr-tts.service";

const STORAGE_KEY = "smart-reading:ocr-tts-state";

const job = (
  status: ReadingJobStatus,
  overrides: Partial<ReadingHistoryResponse> = {},
): ReadingHistoryResponse => ({
  historyId: "h-1",
  name: "page.png",
  extractedText: null,
  audioUrl: null,
  imageUrl: null,
  voice: "female",
  status,
  remark: null,
  errorMessage: null,
  createdAt: "2026-11-01T00:00:00Z",
  ...overrides,
});

const png = (bytes = 1024, type = "image/png") =>
  new File([new Uint8Array(bytes)], "page.png", { type });

/** The store reads sessionStorage at import time, so load it fresh per test. */
async function loadStore() {
  vi.resetModules();
  const mod = await import("./ocr-tts.store");
  return mod.useOcrTtsStore;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(createOcrTtsJob).mockReset();
  vi.mocked(getOcrTtsJob).mockReset();
  vi.mocked(retryOcrTtsJob).mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("pick", () => {
  it("accepts a PNG and resets previous results", async () => {
    const store = await loadStore();
    store.setState({ text: "old", audioUrl: "old.mp3", phase: "done" });

    store.getState().pick(png());

    const s = store.getState();
    expect(s.file?.name).toBe("page.png");
    expect(s.fileMeta).toEqual({ name: "page.png", size: 1024 });
    expect(s.phase).toBe("idle");
    expect(s.text).toBe("");
    expect(s.audioUrl).toBe("");
    expect(s.error).toBeNull();
  });

  it("rejects files over 10MB", async () => {
    const store = await loadStore();
    store.getState().pick(png(10 * 1024 * 1024 + 1));
    expect(store.getState().error).toBe("tooBig");
    expect(store.getState().file).toBeNull();
  });

  it("rejects non PNG/JPG files", async () => {
    const store = await loadStore();
    store.getState().pick(png(10, "image/gif"));
    expect(store.getState().error).toBe("badType");
  });
});

describe("convert + polling", () => {
  it("does nothing without a file", async () => {
    const store = await loadStore();
    await store.getState().convert();
    expect(createOcrTtsJob).not.toHaveBeenCalled();
  });

  it("creates the job with the chosen lang/voice and polls until COMPLETED", async () => {
    const store = await loadStore();
    vi.mocked(createOcrTtsJob).mockResolvedValue(job("PENDING"));
    vi.mocked(getOcrTtsJob)
      .mockResolvedValueOnce(job("OCR_DONE", { extractedText: "Hello" }))
      .mockResolvedValueOnce(
        job("COMPLETED", { extractedText: "Hello", audioUrl: "a.mp3" }),
      );

    store.getState().pick(png());
    await store.getState().convert("en", "male");

    expect(createOcrTtsJob).toHaveBeenCalledWith(
      expect.any(File),
      "male",
      "page.png",
      "en",
    );
    expect(store.getState().phase).toBe("running");
    expect(store.getState().historyId).toBe("h-1");

    await vi.advanceTimersByTimeAsync(1500);
    expect(store.getState().text).toBe("Hello");
    expect(store.getState().phase).toBe("running");
    expect(store.getState().progress).toBeGreaterThan(15);

    await vi.advanceTimersByTimeAsync(1500);
    const s = store.getState();
    expect(s.phase).toBe("done");
    expect(s.progress).toBe(100);
    expect(s.audioUrl).toBe("a.mp3");

    // polling stops once done
    await vi.advanceTimersByTimeAsync(10_000);
    expect(getOcrTtsJob).toHaveBeenCalledTimes(2);
  });

  it("shows the backend error message when the job FAILS", async () => {
    const store = await loadStore();
    vi.mocked(createOcrTtsJob).mockResolvedValue(
      job("FAILED", { errorMessage: "No text found in the image" }),
    );
    store.getState().pick(png());
    await store.getState().convert();

    const s = store.getState();
    expect(s.phase).toBe("error");
    expect(s.error).toBe("failed");
    expect(s.errorMessage).toBe("No text found in the image");
  });

  it("surfaces upload errors", async () => {
    const store = await loadStore();
    // import after resetModules so it is the same class the store sees
    const { CustomApiError } = await import("~/lib/api-client");
    vi.mocked(createOcrTtsJob).mockRejectedValue(
      new CustomApiError("connect ETIMEDOUT", 500),
    );
    store.getState().pick(png());
    await store.getState().convert();

    expect(store.getState().phase).toBe("error");
    expect(store.getState().errorMessage).toBe("connect ETIMEDOUT");
  });

  it("picking a new file cancels the running poll", async () => {
    const store = await loadStore();
    vi.mocked(createOcrTtsJob).mockResolvedValue(job("PENDING"));
    vi.mocked(getOcrTtsJob).mockResolvedValue(job("OCR_PROCESSING"));

    store.getState().pick(png());
    await store.getState().convert();
    store.getState().pick(png(2048));

    await vi.advanceTimersByTimeAsync(5000);
    expect(getOcrTtsJob).not.toHaveBeenCalled();
    expect(store.getState().phase).toBe("idle");
  });
});

describe("retry", () => {
  it("re-queues the failed job and resumes polling", async () => {
    const store = await loadStore();
    store.setState({ historyId: "h-1", phase: "error", error: "failed" });
    vi.mocked(retryOcrTtsJob).mockResolvedValue(job("PENDING"));
    vi.mocked(getOcrTtsJob).mockResolvedValue(
      job("COMPLETED", { audioUrl: "a.mp3" }),
    );

    await store.getState().retry();
    expect(retryOcrTtsJob).toHaveBeenCalledWith("h-1");
    expect(store.getState().error).toBeNull();

    await vi.advanceTimersByTimeAsync(1500);
    expect(store.getState().phase).toBe("done");
  });
});

describe("surviving navigation and reloads", () => {
  it("keeps the running job and file name in the store when the page unmounts", async () => {
    // The store is module-level, so leaving /ocr-tts does not reset it.
    const store = await loadStore();
    vi.mocked(createOcrTtsJob).mockResolvedValue(job("PENDING"));
    vi.mocked(getOcrTtsJob).mockResolvedValue(job("OCR_PROCESSING"));

    store.getState().pick(png());
    await store.getState().convert();
    await vi.advanceTimersByTimeAsync(3000);

    expect(store.getState().phase).toBe("running");
    expect(store.getState().fileMeta?.name).toBe("page.png");
    expect(getOcrTtsJob).toHaveBeenCalledTimes(2);
  });

  it("persists state to sessionStorage (but not the File itself)", async () => {
    const store = await loadStore();
    vi.mocked(createOcrTtsJob).mockResolvedValue(job("PENDING"));
    store.getState().pick(png());
    await store.getState().convert("auto", "male");

    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY)!);
    expect(saved).toMatchObject({
      historyId: "h-1",
      phase: "running",
      lang: "auto",
      voice: "male",
      fileMeta: { name: "page.png", size: 1024 },
    });
    expect(saved).not.toHaveProperty("file");
  });

  it("restores and resumes polling after a reload", async () => {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        historyId: "h-1",
        phase: "running",
        progress: 40,
        fileMeta: { name: "page.png", size: 1024 },
        lang: "en",
        voice: "female",
      }),
    );
    const store = await loadStore();
    expect(store.getState().phase).toBe("running");
    expect(store.getState().lang).toBe("en");

    vi.mocked(getOcrTtsJob).mockResolvedValue(
      job("COMPLETED", { extractedText: "Hi", audioUrl: "a.mp3" }),
    );
    store.getState().resumeIfNeeded();
    await vi.advanceTimersByTimeAsync(0);

    expect(getOcrTtsJob).toHaveBeenCalledWith("h-1");
    expect(store.getState().phase).toBe("done");
    expect(store.getState().text).toBe("Hi");
  });

  it("resumeIfNeeded does not start a second poll loop", async () => {
    const store = await loadStore();
    vi.mocked(createOcrTtsJob).mockResolvedValue(job("PENDING"));
    vi.mocked(getOcrTtsJob).mockResolvedValue(job("OCR_PROCESSING"));
    store.getState().pick(png());
    await store.getState().convert();

    store.getState().resumeIfNeeded(); // e.g. returning to the page
    await vi.advanceTimersByTimeAsync(1500);
    expect(getOcrTtsJob).toHaveBeenCalledTimes(1);
  });

  it("ignores corrupt sessionStorage", async () => {
    window.sessionStorage.setItem(STORAGE_KEY, "{not json");
    const store = await loadStore();
    expect(store.getState().phase).toBe("idle");
  });

  it("reset (logout) clears state and storage", async () => {
    const store = await loadStore();
    store.getState().pick(png());
    store.getState().reset();
    expect(store.getState().file).toBeNull();
    expect(store.getState().fileMeta).toBeNull();
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
