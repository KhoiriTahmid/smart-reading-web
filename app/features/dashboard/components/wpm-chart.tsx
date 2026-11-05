import { useTranslation } from "react-i18next";
import { Badge } from "~/components/ui/badge";
import { Card, CardHeader } from "~/components/ui/card";
import { TrendChart } from "~/components/ui/trend-chart";
import type { ChartPoint } from "../types";

export function WpmChart({ data, avg }: { data: ChartPoint[]; avg: number }) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader
        title={t("dashboardWpm.title")}
        description={t("dashboardWpm.subtitle")}
        action={
          <Badge tone="neutral" dot={false}>
            {t("dashboardWpm.avg", { value: avg })}
          </Badge>
        }
      />
      <TrendChart
        data={data}
        xKey="t"
        yMax={250}
        series={[{ key: "wpm", label: "WPM", color: "var(--acc)", area: true }]}
      />
    </Card>
  );
}
