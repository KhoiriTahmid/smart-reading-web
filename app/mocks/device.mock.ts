import type { PiCommand, PiMessage } from "~/types/device";

export class MockDeviceSocket {
  private timer: ReturnType<typeof setInterval> | null = null;
  public onMessage?: (msg: PiMessage) => void;
  public onStatus?: (status: "connecting" | "open" | "closed") => void;

  public connect(): void {
    this.onStatus?.("connecting");
    setTimeout(() => {
      this.onStatus?.("open");
      this.onMessage?.({
        type: "state",
        mode: "standby",
        page: 1,
        volume: 50,
        speed: 1,
      });

      this.timer = setInterval(() => {
        const fakeTelemetry: PiMessage = {
          type: "telemetry",
          cpuTemp: Math.floor(40 + Math.random() * 25),
          cpuLoad: Math.floor(10 + Math.random() * 80),
          ramUsage: Math.floor(30 + Math.random() * 50),
          wpm: Math.floor(120 + Math.random() * 60),
          ts: Date.now(),
        };
        this.onMessage?.(fakeTelemetry);
      }, 3000);
    }, 500);
  }

  public send(cmd: PiCommand): void {
    if (cmd.type === "volume") {
      this.onMessage?.({
        type: "state",
        mode: "reading",
        page: 1,
        volume: cmd.value,
        speed: 1,
      });
    }
  }

  public close(): void {
    if (this.timer) clearInterval(this.timer);
    this.onStatus?.("closed");
  }
}
