import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge, type BadgeTone } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useDevice } from "~/hooks/use-device-context";
import { useLanguage } from "~/hooks/use-language";
import { getHistoryDetail } from "~/services/history.service";
import type { ReadingHistory, ReadStatus } from "~/types/domain";

const tone: Record<ReadStatus, BadgeTone> = {
  done: "ok",
  processing: "info",
  stopped: "warn",
  failed: "bad",
};

interface HistoryDetailModalProps {
  item: ReadingHistory | null;
  onClose: () => void;
  onRetry?: (id: string) => void;
}

export function HistoryDetailModal({
  item,
  onClose,
  onRetry,
}: HistoryDetailModalProps) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { send } = useDevice();

  const [detail, setDetail] = useState<ReadingHistory | null>(item);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-US", {
        dateStyle: "long",
        timeStyle: "medium",
      }),
    [lang],
  );

  useEffect(() => {
    setDetail(item);
    setCopied(false);
    setSent(false);
    if (!item) return;

    let active = true;
    setLoading(true);
    getHistoryDetail(item.id)
      .then((fresh) => {
        if (active) setDetail(fresh);
      })
      .catch(() => {
        // Fallback to the row item already passed in
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [item, onClose]);

  if (!item || !detail) return null;

  const charCount = detail.extractedText?.length ?? 0;
  const wordCount = detail.extractedText
    ? detail.extractedText.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const copyText = async () => {
    if (!detail.extractedText) return;
    try {
      await navigator.clipboard.writeText(detail.extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-detail-title"
    >
      <div
        className="border-line bg-card flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-line flex items-start justify-between gap-4 border-b px-6 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="history-detail-title"
                className="text-ink break-words text-lg font-bold"
              >
                {detail.title}
              </h2>
              <Badge tone={tone[detail.status]}>
                {t(`history.status.${detail.status}`)}
              </Badge>
              {loading && (
                <Loader2 className="text-mute size-4 animate-spin" />
              )}
            </div>
            <p className="text-mute mt-1 font-mono text-xs">ID: {detail.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("history.modal.close", { defaultValue: "Close" })}
            className="text-mute hover:bg-soft hover:text-ink grid size-8 shrink-0 place-items-center rounded-lg transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5">
          {/* Metadata Grid */}
          <div className="bg-soft grid grid-cols-2 gap-3 rounded-xl p-4 text-xs sm:grid-cols-3">
            <div>
              <p className="text-mute">{t("history.cols.reader")}</p>
              <p className="text-ink mt-0.5 font-semibold">{detail.reader}</p>
            </div>
            <div>
              <p className="text-mute">{t("history.cols.voice")}</p>
              <p className="text-ink mt-0.5 font-semibold capitalize">
                {detail.voice
                  ? t(`ocr.voices.${detail.voice}`, {
                      defaultValue: detail.voice,
                    })
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-mute">
                {t("ocr.lang", { defaultValue: "Language" })}
              </p>
              <p className="text-ink mt-0.5 font-semibold">
                {detail.lang
                  ? t(`ocr.langs.${detail.lang}`, {
                      defaultValue: detail.lang.toUpperCase(),
                    })
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-mute">{t("history.cols.date")}</p>
              <p className="text-ink mt-0.5 font-semibold">
                {fmt.format(new Date(detail.readAt))}
              </p>
            </div>
            <div>
              <p className="text-mute">
                {t("history.modal.pipelineStage", {
                  defaultValue: "Pipeline Status",
                })}
              </p>
              <p className="text-ink mt-0.5 font-mono font-semibold">
                {detail.rawStatus ?? detail.status.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-mute">
                {t("history.modal.textStats", {
                  defaultValue: "Text Length",
                })}
              </p>
              <p className="text-ink mt-0.5 font-semibold">
                {t("history.modal.wordsChars", {
                  words: wordCount,
                  chars: charCount,
                  defaultValue: `${wordCount} words · ${charCount} chars`,
                })}
              </p>
            </div>
          </div>

          {/* Error message or Remark */}
          {detail.errorMessage && (
            <div className="border-bad/30 bg-bad/10 text-bad rounded-xl border px-4 py-3 text-xs">
              <p className="font-semibold">
                {t("history.modal.errorTitle", {
                  defaultValue: "Error Details",
                })}
              </p>
              <p className="mt-1">{detail.errorMessage}</p>
            </div>
          )}

          {detail.remark && (
            <div className="border-line bg-soft text-mute rounded-xl border px-4 py-2.5 text-xs italic">
              {detail.remark}
            </div>
          )}

          {/* Audio Player Section */}
          <div className="bg-soft flex flex-col gap-2.5 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">
                {t("ocr.audio", { defaultValue: "Audio Output" })}
              </span>
              {sent && (
                <Badge tone="ok">
                  {t("ocr.sent", { defaultValue: "Sent" })}
                </Badge>
              )}
            </div>
            {detail.audioUrl ? (
              <audio
                controls
                src={detail.audioUrl}
                className="w-full"
              />
            ) : (
              <p className="text-mute text-xs">
                {t("history.modal.noAudio", {
                  defaultValue: "No synthesized audio available for this entry.",
                })}
              </p>
            )}
          </div>

          {/* Extracted Text & Source Image */}
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">
                  {t("ocr.text", { defaultValue: "Extracted Text" })}
                </span>
                {detail.extractedText && (
                  <Button size="sm" variant="ghost" onClick={() => void copyText()}>
                    {copied ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    {copied
                      ? t("history.modal.copied", { defaultValue: "Copied" })
                      : t("history.modal.copy", { defaultValue: "Copy" })}
                  </Button>
                )}
              </div>
              <div className="border-line bg-bg max-h-64 min-h-36 overflow-y-auto rounded-xl border p-3.5 text-sm leading-relaxed whitespace-pre-wrap">
                {detail.extractedText || (
                  <span className="text-mute italic">
                    {t("history.modal.noText", {
                      defaultValue: "No extracted text available.",
                    })}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">
                  {t("history.modal.sourceImage", {
                    defaultValue: "Source Image",
                  })}
                </span>
                {detail.imageUrl && (
                  <a
                    href={detail.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-acc inline-flex items-center gap-1 text-xs font-medium hover:underline"
                  >
                    {t("history.modal.openFull", { defaultValue: "Open" })}
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
              {detail.imageUrl ? (
                <a
                  href={detail.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="border-line bg-soft flex h-64 items-center justify-center overflow-hidden rounded-xl border"
                >
                  <img
                    src={detail.imageUrl}
                    alt={detail.title}
                    className="max-h-full max-w-full object-contain"
                  />
                </a>
              ) : (
                <div className="border-line bg-soft text-mute flex h-36 items-center justify-center rounded-xl border text-xs">
                  {t("history.modal.noImage", {
                    defaultValue: "No image preview",
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-line flex flex-wrap items-center justify-between gap-2 border-t px-6 py-3.5">
          <div className="flex flex-wrap gap-2">
            {detail.extractedText && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  send({ type: "play_text", text: detail.extractedText! });
                  setSent(true);
                }}
              >
                <Send className="size-3.5" />
                {t("ocr.send", { defaultValue: "Send to Device" })}
              </Button>
            )}
            {onRetry && detail.status === "failed" && (
              <Button
                size="sm"
                variant="accent"
                onClick={() => {
                  onRetry(detail.id);
                  onClose();
                }}
              >
                <RotateCcw className="size-3.5" />
                {t("ocr.retry", { defaultValue: "Retry" })}
              </Button>
            )}
          </div>
          <Button size="sm" onClick={onClose}>
            {t("history.modal.close", { defaultValue: "Close" })}
          </Button>
        </div>
      </div>
    </div>
  );
}
