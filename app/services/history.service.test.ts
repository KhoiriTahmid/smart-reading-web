import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReadingHistoryResponse } from "~/types/domain";

vi.mock("~/lib/api-client", () => ({ apiFetch: vi.fn() }));

import { apiFetch } from "~/lib/api-client";
import {
  deleteHistory,
  getHistory,
  getHistoryDetail,
  retryHistory,
} from "./history.service";

const mockedFetch = vi.mocked(apiFetch);

const row = (
  overrides: Partial<ReadingHistoryResponse> = {},
): ReadingHistoryResponse => ({
  historyId: "h-1",
  name: "page.png",
  extractedText: "Halo",
  audioUrl: "https://s3/audio.mp3",
  imageUrl: "https://s3/img.png",
  voice: "female",
  status: "COMPLETED",
  remark: null,
  errorMessage: null,
  metaDevice: { lang: "en" },
  createdAt: "2026-11-01T00:00:00Z",
  createdByUser: { name: "Budi" },
  ...overrides,
});

beforeEach(() => mockedFetch.mockReset());

describe("getHistory", () => {
  it("maps backend rows into table items", async () => {
    mockedFetch.mockResolvedValueOnce({ count: 1, results: [row()] });
    const [item] = await getHistory();

    expect(mockedFetch).toHaveBeenCalledWith("/reading-histories?limit=100");
    expect(item).toMatchObject({
      id: "h-1",
      title: "page.png",
      reader: "Budi",
      lang: "en",
      rawStatus: "COMPLETED",
      status: "done",
      readAt: "2026-11-01T00:00:00Z",
    });
  });

  it.each([
    ["COMPLETED", "done"],
    ["FAILED", "failed"],
    ["PENDING", "processing"],
    ["OCR_PROCESSING", "processing"],
    ["TTS_PROCESSING", "processing"],
  ] as const)("status %s -> %s", async (raw, mapped) => {
    mockedFetch.mockResolvedValueOnce({ results: [row({ status: raw })] });
    const [item] = await getHistory();
    expect(item.status).toBe(mapped);
  });

  it("falls back for missing name and reader", async () => {
    mockedFetch.mockResolvedValueOnce({
      results: [row({ name: null, createdByUser: null })],
    });
    const [item] = await getHistory();
    expect(item.title).toBe("Untitled Scan");
    expect(item.reader).toBe("—");
  });

  it("accepts a bare array and an empty payload", async () => {
    mockedFetch.mockResolvedValueOnce([row()]);
    expect(await getHistory()).toHaveLength(1);
    mockedFetch.mockResolvedValueOnce(undefined);
    expect(await getHistory()).toEqual([]);
  });
});

describe("detail and actions", () => {
  it("getHistoryDetail fetches a single row (fresh presigned URLs)", async () => {
    mockedFetch.mockResolvedValueOnce(row({ audioUrl: "https://s3/fresh" }));
    const item = await getHistoryDetail("h-1");
    expect(mockedFetch).toHaveBeenCalledWith("/reading-histories/h-1");
    expect(item.audioUrl).toBe("https://s3/fresh");
  });

  it("retryHistory POSTs to the retry endpoint", async () => {
    mockedFetch.mockResolvedValueOnce(row());
    await retryHistory("h-1");
    expect(mockedFetch).toHaveBeenCalledWith("/reading-histories/h-1/retry", {
      method: "POST",
    });
  });

  it("deleteHistory sends a DELETE", async () => {
    mockedFetch.mockResolvedValueOnce(undefined);
    await deleteHistory("h-1");
    expect(mockedFetch.mock.calls[0][0]).toContain("/reading-histories/h-1");
    expect(mockedFetch.mock.calls[0][1]).toMatchObject({ method: "DELETE" });
  });
});
