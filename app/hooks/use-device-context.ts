import { useOutletContext } from "react-router";
import type { useDeviceSocket } from "./use-device-socket";

export interface DeviceOutletContext {
  send: ReturnType<typeof useDeviceSocket>["send"];
}

/** Use inside any child route to send commands to the Raspberry Pi. */
export function useDevice() {
  return useOutletContext<DeviceOutletContext>();
}
