export type DeviceMode =
  "reading" | "paused" | "standby" | "flipping" | "off" | "restarting";
export type ConnStatus = "connecting" | "open" | "closed";

export interface ChartPoint {
  t: string;
  wpm: number;
  cpuTemp: number;
  cpuLoad: number;
  ramUsage: number;
}
