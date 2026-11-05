import { useRevalidator } from "react-router";
import { HistoryTable } from "~/features/history/components/history-table";
import { CustomApiError } from "~/lib/api-client";
import {
  deleteHistory,
  getHistory,
  retryHistory,
} from "~/services/history.service";
import type { Route } from "./+types/history";

export function meta() {
  return [{ title: "History Read · Smart Reading" }];
}

export async function clientLoader() {
  try {
    return { items: await getHistory() };
  } catch (error) {
    if (
      error instanceof CustomApiError &&
      (error.status === 403 || error.status === 404)
    ) {
      return { items: [] };
    }
    throw error;
  }
}

export default function HistoryRoute({ loaderData }: Route.ComponentProps) {
  const { revalidate } = useRevalidator();

  const handleRetry = async (id: string) => {
    try {
      await retryHistory(id);
      await revalidate();
    } catch (error) {
      console.error("Failed to retry history item:", error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHistory(id);
      await revalidate();
    } catch (error) {
      console.error("Failed to delete history item:", error);
      throw error;
    }
  };

  return (
    <HistoryTable
      items={loaderData.items}
      onRetry={(id) => void handleRetry(id)}
      onDelete={(id) => void handleDelete(id)}
    />
  );
}
