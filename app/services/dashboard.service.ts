import { apiFetch } from "~/lib/api-client";
import { delay, USE_MOCK } from "~/lib/env";
import { PATHS } from "./paths";

export interface DashboardSummary {
  backend: {
    healthy: boolean;
    latencyMs: number | null;
    ocrServiceHealthy?: boolean;
  };
  queueTasks: number;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (USE_MOCK) {
    await delay(100);
    return {
      backend: { healthy: true, latencyMs: 12, ocrServiceHealthy: true },
      queueTasks: 0,
    };
  }

  const start = performance.now();
  try {
    const summary = await apiFetch<DashboardSummary>(PATHS.dashboard);
    const measuredLatency = Math.max(1, Math.round(performance.now() - start));
    return {
      backend: {
        healthy: summary?.backend?.healthy ?? true,
        latencyMs: summary?.backend?.latencyMs ?? measuredLatency,
        ocrServiceHealthy: summary?.backend?.ocrServiceHealthy,
      },
      queueTasks: summary?.queueTasks ?? 0,
    };
  } catch {
    return {
      backend: { healthy: false, latencyMs: null },
      queueTasks: 0,
    };
  }
}
