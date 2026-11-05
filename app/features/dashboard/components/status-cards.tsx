import { Activity, Cpu, ListChecks, Server } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge, type BadgeTone } from "~/components/ui/badge";
import type { ConnStatus, DeviceMode } from "../types";
import { StatCard, type StatTone } from "./stat-card";

const connTone: Record<ConnStatus, BadgeTone> = {
  open: "ok",
  connecting: "warn",
  closed: "bad",
};
const modeTone: Record<DeviceMode, StatTone> = {
  reading: "ok",
  paused: "warn",
  standby: "neutral",
  flipping: "info",
  off: "bad",
  restarting: "warn",
};

interface StatusCardsProps {
  status: ConnStatus;
  mode: DeviceMode;
  page: number;
  backend: { healthy: boolean; latencyMs: number | null };
  queueTasks: number;
}

export function StatusCards({
  status,
  mode,
  page,
  backend,
  queueTasks,
}: StatusCardsProps) {
  const { t } = useTranslation();
  const powered = mode !== "off";

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={t("dashboardCards.device")}
        title="raspi-reader-01"
        subtitle={String(import.meta.env.VITE_WS_URL ?? "")}
        icon={Cpu}
        tone={status === "open" ? "ok" : "bad"}
        footerLabel={t("dashboardCards.connection")}
        footer={
          <Badge tone={connTone[status]}>{t(`dashboardConn.${status}`)}</Badge>
        }
      />
      <StatCard
        label={t("dashboardCards.backend")}
        title="OCR · TTS · DB"
        subtitle={String(import.meta.env.VITE_API_URL ?? "")}
        icon={Server}
        tone="info"
        footerLabel={t("dashboardCards.latency")}
        footer={
          <Badge tone={backend.healthy ? "ok" : "bad"}>
            {backend.latencyMs === null ? "—" : `${backend.latencyMs} ms`}
          </Badge>
        }
      />
      <StatCard
        label={t("dashboardCards.mode")}
        title={t(`dashboardMode.${mode}`)}
        subtitle={page > 0 ? t("dashboardCards.page", { page }) : undefined}
        icon={Activity}
        tone={modeTone[mode]}
        footerLabel={t("dashboardCards.power")}
        footer={
          <Badge tone={powered ? "ok" : "bad"}>
            {powered ? t("dashboardStatus.on") : t("dashboardStatus.off")}
          </Badge>
        }
      />
      <StatCard
        label={t("dashboardCards.queue")}
        title={t("dashboardCards.tasks", { count: queueTasks })}
        subtitle="OCR → TTS"
        icon={ListChecks}
        tone="neutral"
        footerLabel={t("dashboardCards.queueStatus")}
        footer={
          <Badge tone={queueTasks > 0 ? "info" : "neutral"}>
            {queueTasks > 0
              ? t("dashboardQueue.processing")
              : t("dashboardQueue.idle")}
          </Badge>
        }
      />
    </div>
  );
}
