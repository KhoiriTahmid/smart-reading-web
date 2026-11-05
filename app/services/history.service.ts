// app/services/history.service.ts
import { apiFetch } from "~/lib/api-client";
import { delay, USE_MOCK } from "~/lib/env";
import { db } from "~/mocks/db";
import type {
  ReadingHistory,
  ReadingHistoryResponse,
  ReadingJobStatus,
  ReadStatus,
} from "~/types/domain";
import { PATHS } from "./paths";
import type { Pagiantion } from "./roles.service";

interface HistoryListResponse extends Pagiantion<ReadingHistoryResponse[]> {}

function mapStatus(status: ReadingJobStatus): ReadStatus {
  if (status === "COMPLETED") return "done";
  if (status === "FAILED") return "failed";
  return "processing";
}

function toReadingHistory(row: ReadingHistoryResponse): ReadingHistory {
  return {
    id: row.historyId,
    title: row.name || "Untitled Scan",
    reader: row.createdByUser?.name || "—",
    extractedText: row.extractedText,
    audioUrl: row.audioUrl,
    imageUrl: row.imageUrl,
    sourceMimeType: row.sourceMimeType,
    voice: row.voice,
    lang: row.metaDevice?.lang,
    remark: row.remark,
    errorMessage: row.errorMessage,
    rawStatus: row.status,
    readAt: row.createdAt,
    updatedAt: row.updatedAt,
    status: mapStatus(row.status),
  };
}

export async function getHistory(): Promise<ReadingHistory[]> {
  if (USE_MOCK) {
    await delay();
    return structuredClone(db.history);
  }
  const response = await apiFetch<HistoryListResponse>(
    `${PATHS.history}?limit=100`,
  );
  const items = Array.isArray(response) ? response : (response?.results ?? []);
  return items.map(toReadingHistory);
}

export async function getHistoryDetail(
  historyId: string,
): Promise<ReadingHistory> {
  if (USE_MOCK) {
    await delay(150);
    const found = db.history.find((h) => h.id === historyId);
    if (!found) throw new Error("Not found");
    return structuredClone(found);
  }
  const row = await apiFetch<ReadingHistoryResponse>(
    `${PATHS.history}/${historyId}`,
  );
  return toReadingHistory(row);
}

export async function retryHistory(historyId: string): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    const item = db.history.find((h) => h.id === historyId);
    if (item) item.status = "done";
    return;
  }
  await apiFetch<ReadingHistoryResponse>(`${PATHS.history}/${historyId}/retry`, {
    method: "POST",
  });
}

export async function deleteHistory(historyId: string): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    db.history = db.history.filter((h) => h.id !== historyId);
    return;
  }
  await apiFetch<unknown>(`${PATHS.history}/${historyId}`, {
    method: "DELETE",
  });
}
