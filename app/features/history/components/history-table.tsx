import { ExternalLink, Eye, RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge, type BadgeTone } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { ConfirmButton } from "~/components/ui/confirm-button";
import { Input, Select } from "~/components/ui/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "~/components/ui/table";
import { useLanguage } from "~/hooks/use-language";
import type { ReadingHistory, ReadStatus } from "~/types/domain";
import { HistoryDetailModal } from "./history-detail-modal";

const tone: Record<ReadStatus, BadgeTone> = {
  done: "ok",
  processing: "info",
  stopped: "warn",
  failed: "bad",
};
const cols = [
  "title",
  "reader",
  "voice",
  "audio",
  "date",
  "status",
] as const;

interface HistoryTableProps {
  items: ReadingHistory[];
  onRetry?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function HistoryTable({
  items,
  onRetry,
  onDelete,
}: HistoryTableProps) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ReadStatus>("all");
  const [selectedItem, setSelectedItem] = useState<ReadingHistory | null>(null);

  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [lang],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (i) =>
        (status === "all" || i.status === status) &&
        (!q ||
          `${i.title} ${i.reader} ${i.extractedText ?? ""}`
            .toLowerCase()
            .includes(q)),
    );
  }, [items, query, status]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="text-mute pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("history.search")}
            className="pl-9"
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as "all" | ReadStatus)}
          >
            <option value="all">{t("history.allStatus")}</option>
            <option value="done">{t("history.status.done")}</option>
            <option value="processing">
              {t("history.status.processing", { defaultValue: "Processing" })}
            </option>
            <option value="failed">{t("history.status.failed")}</option>
          </Select>
        </div>
      </div>

      <Card className="p-2">
        <Table>
          <TableHead>
            <TableRow>
              {cols.map((c) => (
                <TableHeadCell key={c}>{t(`history.cols.${c}`)}</TableHeadCell>
              ))}
              <TableHeadCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={cols.length + 1}
                  className="text-mute py-10 text-center"
                >
                  {t("history.empty")}
                </TableCell>
              </TableRow>
            )}
            {rows.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="max-w-xs">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(i)}
                      className="hover:text-acc truncate text-left transition-colors hover:underline"
                    >
                      {i.title}
                    </button>
                    {i.imageUrl && (
                      <a
                        href={i.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        title={t("history.viewImage", {
                          defaultValue: "View source image",
                        })}
                        className="text-mute hover:text-acc shrink-0"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>
                  {i.extractedText && (
                    <p className="text-mute mt-0.5 line-clamp-2 text-xs">
                      {i.extractedText}
                    </p>
                  )}
                  {i.errorMessage && i.status === "failed" && (
                    <p className="text-bad mt-0.5 line-clamp-2 text-xs">
                      {i.errorMessage}
                    </p>
                  )}
                </TableCell>
                <TableCell>{i.reader}</TableCell>
                <TableCell className="capitalize">
                  {i.voice
                    ? t(`ocr.voices.${i.voice}`, { defaultValue: i.voice })
                    : i.pages ?? "—"}
                </TableCell>
                <TableCell className="min-w-48">
                  {i.audioUrl ? (
                    <audio
                      controls
                      preload="none"
                      src={i.audioUrl}
                      className="h-8 w-48 max-w-full"
                    />
                  ) : i.durationMin !== undefined ? (
                    t("history.minutes", { count: i.durationMin })
                  ) : (
                    <span className="text-mute text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="text-mute whitespace-nowrap text-xs">
                  {fmt.format(new Date(i.readAt))}
                </TableCell>
                <TableCell>
                  <Badge tone={tone[i.status]}>
                    {t(`history.status.${i.status}`)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedItem(i)}
                      title={t("history.detail", { defaultValue: "Detail" })}
                    >
                      <Eye className="size-3.5" />
                      {t("history.detail", { defaultValue: "Detail" })}
                    </Button>
                    {onRetry && i.status === "failed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRetry(i.id)}
                        title={t("ocr.retry", { defaultValue: "Retry" })}
                      >
                        <RotateCcw className="size-3.5" />
                        {t("ocr.retry", { defaultValue: "Retry" })}
                      </Button>
                    )}
                    {onDelete && (
                      <ConfirmButton
                        size="sm"
                        variant="ghost"
                        label={t("history.delete", { defaultValue: "Delete" })}
                        confirmLabel={t("history.confirmDelete", {
                          defaultValue: "Confirm",
                        })}
                        onConfirm={() => onDelete(i.id)}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <HistoryDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onRetry={onRetry}
      />
    </div>
  );
}
