import {
  ArrowLeft,
  ArrowRight,
  Pause,
  Play,
  Power,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import { Card, CardHeader } from "~/components/ui/card";
import { Slider } from "~/components/ui/slider";
import type { DeviceOutletContext } from "~/hooks/use-device-context";
import type { ConnStatus, DeviceMode } from "../types";
import { ConfirmButton } from "~/components/ui/confirm-button";

const presets = [1, 1.25, 1.5];

interface DeviceControlsProps {
  send: DeviceOutletContext["send"];
  status: ConnStatus;
  mode: DeviceMode;
  page: number;
  volume: number;
  speed: number;
}

function Tile({
  title,
  value,
  children,
}: {
  title: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-soft flex flex-col gap-3 rounded-xl p-4">
      <div className="flex items-center justify-between text-[13px] font-semibold">
        <span>{title}</span>
        {value && <span className="text-acc font-mono text-xs">{value}</span>}
      </div>
      {children}
    </div>
  );
}

export function DeviceControls({
  send,
  status,
  mode,
  page,
  volume,
  speed,
}: DeviceControlsProps) {
  const { t } = useTranslation();
  const [vol, setVol] = useState(volume);
  const [spd, setSpd] = useState(speed);
  const lastVol = useRef(volume || 75);

  // Follow the device when it reports a new value.
  useEffect(() => setVol(volume), [volume]);
  useEffect(() => setSpd(speed), [speed]);

  const offline = status !== "open";
  const busy = mode === "off" || mode === "restarting";
  const locked = offline || busy;
  const paused = mode === "paused";
  const muted = vol === 0;

  const commitVolume = (v: number) => {
    if (v > 0) lastVol.current = v;
    send({ type: "volume", value: v });
  };
  const toggleMute = () => {
    const next = muted ? lastVol.current : 0;
    setVol(next);
    send({ type: "volume", value: next });
  };
  const setSpeed = (v: number) => {
    setSpd(v);
    send({ type: "tts_speed", value: v });
  };

  return (
    <Card>
      <CardHeader
        title={t("dashboardControls.title")}
        description={t("dashboardControls.subtitle")}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Tile title={t("dashboardControls.volume")} value={`${vol}%`}>
          <Slider
            value={vol}
            min={0}
            max={100}
            disabled={locked}
            onValueChange={setVol}
            onValueCommit={commitVolume}
          />
          <Button
            size="sm"
            disabled={locked}
            onClick={toggleMute}
            className="self-start"
          >
            {muted ? (
              <Volume2 className="size-4" />
            ) : (
              <VolumeX className="size-4" />
            )}
            {muted
              ? t("dashboardControls.unmute")
              : t("dashboardControls.mute")}
          </Button>
        </Tile>

        <Tile
          title={t("dashboardControls.speed")}
          value={`${spd.toFixed(2).replace(/0$/, "")}x`}
        >
          <Slider
            value={spd}
            min={0.5}
            max={2}
            step={0.1}
            disabled={locked}
            onValueChange={setSpd}
            onValueCommit={(v) => send({ type: "tts_speed", value: v })}
          />
          <div className="flex gap-2">
            {presets.map((p) => (
              <Button
                key={p}
                size="sm"
                disabled={locked}
                onClick={() => setSpeed(p)}
              >
                {p}x
              </Button>
            ))}
          </div>
        </Tile>

        <Tile
          title={t("dashboardControls.pageFlipper")}
          value={page > 0 ? t("dashboardCards.page", { page }) : undefined}
        >
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              disabled={locked || page <= 1}
              onClick={() => send({ type: "flip", step: -1 })}
            >
              <ArrowLeft className="size-4" />
              {t("dashboardControls.prev")}
            </Button>
            <Button
              size="sm"
              variant="accent"
              disabled={locked}
              onClick={() => send({ type: "flip", step: 1 })}
            >
              {t("dashboardControls.next")}
              <ArrowRight className="size-4" />
            </Button>
          </div>
          <Button
            variant="primary"
            size="sm"
            disabled={locked}
            onClick={() =>
              send({ type: "speech", action: paused ? "resume" : "pause" })
            }
          >
            {paused ? (
              <Play className="size-4" />
            ) : (
              <Pause className="size-4" />
            )}
            {paused
              ? t("dashboardControls.resume")
              : t("dashboardControls.pause")}
          </Button>
        </Tile>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <ConfirmButton
          label={
            <>
              <RotateCcw className="size-4" />
              {t("dashboardControls.restart")}
            </>
          }
          confirmLabel={t("dashboardControls.confirm")}
          disabled={offline || busy}
          onConfirm={() => send({ type: "power", mode: "restart" })}
        />
        {mode === "off" ? (
          <Button
            variant="accent"
            disabled={offline}
            onClick={() => send({ type: "power", mode: "on" })}
          >
            <Power className="size-4" />
            {t("dashboardControls.powerOn")}
          </Button>
        ) : (
          <ConfirmButton
            variant="danger"
            label={
              <>
                <Power className="size-4" />
                {t("dashboardControls.powerOff")}
              </>
            }
            confirmLabel={t("dashboardControls.confirm")}
            disabled={offline || mode === "restarting"}
            onConfirm={() => send({ type: "power", mode: "off" })}
          />
        )}
      </div>
    </Card>
  );
}
