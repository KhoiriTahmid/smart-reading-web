import { RotateCcw, Send, Square, Upload, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardHeader } from "~/components/ui/card";
import { Field, Select, Textarea } from "~/components/ui/field";
import { Progress } from "~/components/ui/progress";
import { useDevice } from "~/hooks/use-device-context";
import { cn } from "~/lib/cn";
import type { OcrLang, TtsVoice } from "~/types/domain";
import { useOcrTts } from "../hooks/use-ocr-tts";

const formatSize = (bytes: number) =>
  bytes > 1_048_576
    ? `${(bytes / 1_048_576).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export function OcrTtsPanel() {
  const { t } = useTranslation();
  const { send } = useDevice();
  const o = useOcrTts();

  const [drag, setDrag] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(
    () => () => {
      window.speechSynthesis.cancel();
    },
    [],
  );

  const togglePreview = () => {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(o.text);
    if (o.lang !== "auto") u.lang = o.lang === "id" ? "id-ID" : "en-US";
    u.onend = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
  };

  const running = o.phase === "running";
  const hasResult = o.phase === "done";
  const activeFileName = o.file?.name ?? o.fileMeta?.name ?? null;
  const activeFileSize = o.file?.size ?? o.fileMeta?.size ?? 0;

  const getRunningStageText = () => {
    if (!o.jobStatus) return t("ocr.running");
    switch (o.jobStatus) {
      case "PENDING":
        return t("ocr.stages.pending", {
          defaultValue: "Queued for processing...",
        });
      case "OCR_PROCESSING":
        return t("ocr.stages.ocr", {
          defaultValue: "Extracting text from image (OCR)...",
        });
      case "OCR_DONE":
      case "TTS_PROCESSING":
        return t("ocr.stages.tts", {
          defaultValue: "Synthesizing speech (TTS)...",
        });
      default:
        return t("ocr.running");
    }
  };

  const statusText = o.error
    ? o.errorMessage || t(`ocr.errors.${o.error}`)
    : running
      ? getRunningStageText()
      : hasResult
        ? t("ocr.done")
        : activeFileName
          ? t("ocr.ready")
          : t("ocr.waiting");

  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <Card className="flex flex-col gap-4">
        <CardHeader title={t("ocr.upload")} />

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files[0];
            if (f) o.pick(f);
          }}
          className={cn(
            "border-line text-mute flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-[1.5px] border-dashed px-5 py-9 text-center transition-colors",
            drag
              ? "border-acc bg-accbg text-acc"
              : "hover:border-acc hover:bg-accbg hover:text-acc",
          )}
        >
          <Upload className="size-7" />
          <span className="text-ink text-sm font-semibold">
            {activeFileName
              ? activeFileSize > 0
                ? `${activeFileName} · ${formatSize(activeFileSize)}`
                : activeFileName
              : t("ocr.drop")}
          </span>
          <span className="text-xs">{t("ocr.hint")}</span>
          <input
            type="file"
            accept="image/png,image/jpeg"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) o.pick(f);
              e.target.value = "";
            }}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("ocr.lang")}>
            <Select
              value={o.lang}
              onChange={(e) => o.setLang(e.target.value as OcrLang)}
            >
              <option value="id">{t("ocr.langs.id")}</option>
              <option value="en">{t("ocr.langs.en")}</option>
              <option value="auto">{t("ocr.langs.auto")}</option>
            </Select>
          </Field>
          <Field label={t("ocr.voice")}>
            <Select
              value={o.voice}
              onChange={(e) => o.setVoice(e.target.value as TtsVoice)}
            >
              <option value="female">{t("ocr.voices.female")}</option>
              <option value="male">{t("ocr.voices.male")}</option>
            </Select>
          </Field>
        </div>

        <div className="flex gap-2">
          <Button
            variant="accent"
            className="flex-1"
            disabled={!o.file || running}
            onClick={() => void o.convert(o.lang, o.voice)}
          >
            {running ? t("ocr.running") : t("ocr.convert")}
          </Button>
          {o.phase === "error" && o.historyId && (
            <Button
              variant="primary"
              disabled={running}
              onClick={() => void o.retry()}
            >
              <RotateCcw className="size-4" />
              {t("ocr.retry", { defaultValue: "Retry" })}
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Progress value={o.progress} />
          <p className={cn("text-xs", o.error ? "text-bad" : "text-mute")}>
            {statusText}
          </p>
          {o.remark && (
            <p className="text-mute text-xs italic">{o.remark}</p>
          )}
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <CardHeader
          title={t("ocr.result")}
          action={o.sent && <Badge>{t("ocr.sent")}</Badge>}
        />

        <Field label={t("ocr.text")}>
          <Textarea
            value={o.text}
            onChange={(e) => {
              o.setText(e.target.value);
            }}
            placeholder={t("ocr.textPlaceholder")}
          />
        </Field>

        <div className="bg-soft flex flex-col gap-3 rounded-xl p-4">
          <p className="text-[13px] font-semibold">{t("ocr.audio")}</p>
          {o.audioUrl ? (
            <audio controls src={o.audioUrl} className="w-full" />
          ) : (
            <Button
              size="sm"
              disabled={!o.text}
              onClick={togglePreview}
              className="self-start"
            >
              {speaking ? (
                <Square className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
              {speaking ? t("ocr.stop") : t("ocr.preview")}
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            disabled={!o.text}
            onClick={() => {
              send({ type: "play_text", text: o.text });
              o.setSent(true);
            }}
            className="self-start"
          >
            <Send className="size-4" />
            {t("ocr.send")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
