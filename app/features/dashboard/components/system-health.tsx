import { useTranslation } from "react-i18next";
import { Card, CardHeader } from "~/components/ui/card";
import { TrendChart, type ChartSeries } from "~/components/ui/trend-chart";
import { cn } from "~/lib/cn";
import type { ChartPoint } from "../types";

interface SystemHealthProps {
  data: ChartPoint[];
  latest: { cpuTemp: number; cpuLoad: number; ramUsage: number } | null;
}

function Metric({
  label,
  value,
  unit,
  color,
  valueClass,
}: {
  label: string;
  value?: number;
  unit: string;
  color: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-soft rounded-xl p-3">
      <p className="text-mute flex items-center gap-1.5 text-[11px] font-medium">
        <span className="size-2 rounded-full" style={{ background: color }} />
        {label}
      </p>
      <p className={cn("mt-1 text-lg font-bold", valueClass)}>
        {value === undefined ? "—" : Math.round(value)}
        <span className="text-mute ml-0.5 text-xs font-medium">{unit}</span>
      </p>
    </div>
  );
}

export function SystemHealth({ data, latest }: SystemHealthProps) {
  const { t } = useTranslation();
  const temp = latest?.cpuTemp;
  const tempClass =
    temp === undefined
      ? ""
      : temp >= 80
        ? "text-bad"
        : temp >= 70
          ? "text-warn"
          : "";

  const series: ChartSeries[] = [
    {
      key: "cpuTemp",
      label: t("dashboardSystem.cpuTemp"),
      color: "var(--warn)",
    },
    {
      key: "cpuLoad",
      label: t("dashboardSystem.cpuLoad"),
      color: "var(--acc)",
      area: true,
    },
    { key: "ramUsage", label: t("dashboardSystem.ram"), color: "var(--info)" },
  ];

  return (
    <Card>
      <CardHeader
        title={t("dashboardSystem.title")}
        description={t("dashboardSystem.subtitle")}
      />
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Metric
          label={t("dashboardSystem.cpuTemp")}
          value={temp}
          unit="°C"
          color="var(--warn)"
          valueClass={tempClass}
        />
        <Metric
          label={t("dashboardSystem.cpuLoad")}
          value={latest?.cpuLoad}
          unit="%"
          color="var(--acc)"
        />
        <Metric
          label={t("dashboardSystem.ram")}
          value={latest?.ramUsage}
          unit="%"
          color="var(--info)"
        />
      </div>
      <TrendChart
        data={data}
        xKey="t"
        yMax={100}
        series={series}
        height={150}
      />
    </Card>
  );
}
