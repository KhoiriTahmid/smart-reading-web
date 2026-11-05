export type PiCommand =
  | { type: "volume"; value: number }
  | { type: "tts_speed"; value: number }
  | { type: "flip"; step: 1 | -1 }
  | { type: "speech"; action: "pause" | "resume" }
  | { type: "power"; mode: "on" | "off" | "restart" }
  | { type: "play_text"; text: string };

export type TelemetryMessage = {
  type: "telemetry";
  cpuTemp: number;
  cpuLoad: number;
  ramUsage: number;
  wpm: number;
  ts: number;
};

export type StateMessage = {
  type: "state";
  mode: "reading" | "paused" | "standby" | "flipping" | "off" | "restarting";
  page: number;
  volume: number;
  speed: number;
};

export type AckMessage = {
  type: "ack";
  ok: boolean;
  ref?: string;
};

export type PiMessage = TelemetryMessage | StateMessage | AckMessage;

export type ConnectionStatus = "connecting" | "open" | "closed";
