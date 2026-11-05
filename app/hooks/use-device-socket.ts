import { useEffect, useRef } from "react";
import { ReconnectingWebSocketClient } from "~/lib/ws-client";
import { MockDeviceSocket } from "~/mocks/device.mock";
import { useDeviceStore } from "~/stores/device.store";
import type { PiCommand, PiMessage } from "~/types/device";

export function useDeviceSocket() {
  const { setStatus, setState, pushTelemetry, status } =
    useDeviceStore();
  const clientRef = useRef<
    ReconnectingWebSocketClient | MockDeviceSocket | null
  >(null);

  useEffect(() => {
    const isMock = import.meta.env.VITE_USE_MOCK === "true";
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8765";

    const client = isMock
      ? new MockDeviceSocket()
      : new ReconnectingWebSocketClient(wsUrl);

    client.onStatus = (nextStatus) => {
      setStatus(nextStatus);
    };

    client.onMessage = (msg: PiMessage) => {
      if (import.meta.env.DEV) {
        console.log("[WS/Mock Device Message]:", msg);
      }
      if (msg.type === "telemetry") {
        pushTelemetry(msg);
      } else if (msg.type === "state") {
        setState(msg);
      }
    };

    client.connect();
    clientRef.current = client;

    return () => {
      client.close();
      clientRef.current = null;
    };
  }, [setStatus, setState, pushTelemetry]);

  const send = (cmd: PiCommand) => {
    clientRef.current?.send(cmd);
  };

  return { send, status };
}
