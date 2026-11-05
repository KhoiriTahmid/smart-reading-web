import { useEffect, useState } from "react";
import { DeviceControls } from "~/features/dashboard/components/device-controls";
import { StatusCards } from "~/features/dashboard/components/status-cards";
import { SystemHealth } from "~/features/dashboard/components/system-health";
import { WpmChart } from "~/features/dashboard/components/wpm-chart";
import { useDashboardData } from "~/features/dashboard/hooks/use-dashboard-data";
import { useDevice } from "~/hooks/use-device-context";
import {
  getDashboardSummary,
  type DashboardSummary,
} from "~/services/dashboard.service";

const POLL_MS = 10_000;

export default function DashboardRoute() {
  const { send } = useDevice();
  const d = useDashboardData();

  const [summary, setSummary] = useState<DashboardSummary>({
    backend: { healthy: true, latencyMs: null },
    queueTasks: 0,
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      const next = await getDashboardSummary();
      if (active) setSummary(next);
    };

    void load();
    const id = setInterval(() => void load(), POLL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <StatusCards
        status={d.status}
        mode={d.mode}
        page={d.page}
        backend={summary.backend}
        queueTasks={summary.queueTasks}
      />
      <DeviceControls
        send={send}
        status={d.status}
        mode={d.mode}
        page={d.page}
        volume={d.volume}
        speed={d.speed}
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <WpmChart data={d.chart} avg={d.avgWpm} />
        <SystemHealth data={d.chart} latest={d.latest} />
      </div>
    </div>
  );
}
