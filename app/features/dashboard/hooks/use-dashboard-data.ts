import { useMemo } from "react";
import { useDeviceStore } from "~/stores/device.store";
import type { ChartPoint, ConnStatus, DeviceMode } from "../types";

export function useDashboardData() {
  const status = useDeviceStore((s) => s.status) as ConnStatus;
  const state = useDeviceStore((s) => s.state);
  const telemetry = useDeviceStore((s) => s.telemetry);

  const chart = useMemo<ChartPoint[]>(
    () =>
      telemetry.map((p) => ({
        t: new Date(p.ts).toTimeString().slice(0, 8),
        wpm: p.wpm,
        cpuTemp: p.cpuTemp,
        cpuLoad: p.cpuLoad,
        ramUsage: p.ramUsage,
      })),
    [telemetry],
  );

  const latest = telemetry.at(-1) ?? null;
  const avgWpm = telemetry.length
    ? Math.round(
        telemetry.reduce((sum, p) => sum + p.wpm, 0) / telemetry.length,
      )
    : 0;

  return {
    status,
    mode: (state?.mode ?? "standby") as DeviceMode,
    page: state?.page ?? 0,
    volume: state?.volume ?? 75,
    speed: state?.speed ?? 1,
    latest,
    chart,
    avgWpm,
  };
}
