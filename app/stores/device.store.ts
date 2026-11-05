import { create } from "zustand";
import type {
  ConnectionStatus,
  StateMessage,
  TelemetryMessage,
} from "~/types/device";

export interface DeviceStore {
  status: ConnectionStatus;
  state: StateMessage | null;
  telemetry: TelemetryMessage[];
  setStatus: (status: ConnectionStatus) => void;
  setState: (state: StateMessage) => void;
  pushTelemetry: (data: TelemetryMessage) => void;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  status: "closed",
  state: null,
  telemetry: [],

  setStatus: (status) => set({ status }),

  setState: (state) => set({ state }),

  pushTelemetry: (data) =>
    set((s) => ({
      telemetry: [...s.telemetry.slice(-19), data],
    })),
}));
