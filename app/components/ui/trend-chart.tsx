import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ChartSeries {
  key: string;
  label: string;
  /** Any CSS color, e.g. "var(--acc)" */
  color: string;
  /** Soft fill under the line */
  area?: boolean;
}

interface TrendChartProps {
  data: object[];
  xKey: string;
  series: ChartSeries[];
  yMin?: number;
  yMax?: number;
  height?: number;
}

const tick = { fill: "var(--mute)", fontSize: 11 };

/** Client-only (mounted guard), so it is safe for SSR later. */
export function TrendChart({
  data,
  xKey,
  series,
  yMin = 0,
  yMax,
  height = 190,
}: TrendChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ height }} />;

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
        >
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis dataKey={xKey} tick={tick} tickLine={false} axisLine={false} />
          <YAxis
            domain={[yMin, yMax ?? "auto"]}
            tick={tick}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            cursor={{ stroke: "var(--line)" }}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              fontSize: 12,
              color: "var(--ink)",
            }}
          />
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2.2}
              fill={s.color}
              fillOpacity={s.area ? 0.1 : 0}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
