import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardHeader } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Field, Input, Select, Textarea } from "~/components/ui/field";
import { Progress } from "~/components/ui/progress";
import { Slider } from "~/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "~/components/ui/table";
import { TrendChart } from "~/components/ui/trend-chart";

const data = ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25"].map(
  (t, i) => ({
    t,
    cpu: [25, 30, 45, 60, 40, 35][i],
    temp: [41, 43, 48, 55, 50, 47][i],
  }),
);

export default function Playground() {
  const [vol, setVol] = useState(75);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="flex flex-col gap-4">
        <CardHeader
          title="Buttons & badges"
          description="All variants"
          action={<Badge tone="info">info</Badge>}
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="primary">Primary</Button>
          <Button>Secondary</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm" disabled>
            Disabled
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>ok</Badge>
          <Badge tone="warn">warn</Badge>
          <Badge tone="bad">bad</Badge>
          <Badge tone="neutral" dot={false}>
            neutral
          </Badge>
        </div>
        <Field label={`Volume ${vol}%`}>
          <Slider
            value={vol}
            onValueChange={setVol}
            onValueCommit={(v) => console.log("commit", v)}
            min={0}
            max={100}
          />
        </Field>
        <Progress value={vol} />
      </Card>

      <Card className="flex flex-col gap-4">
        <CardHeader title="Form" />
        <Field label="Name">
          <Input placeholder="Full name" />
        </Field>
        <Field label="Voice">
          <Select>
            <option>Default</option>
            <option>Female</option>
          </Select>
        </Field>
        <Field label="Text">
          <Textarea placeholder="OCR result…" />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox defaultChecked /> Checkbox
        </label>
      </Card>

      <Card>
        <CardHeader title="Chart" description="CPU % and temp °C" />
        <TrendChart
          data={data}
          xKey="t"
          yMax={100}
          series={[
            { key: "cpu", label: "CPU %", color: "var(--acc)", area: true },
            { key: "temp", label: "Temp °C", color: "var(--info)" },
          ]}
        />
      </Card>

      <Card className="p-2">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Rina</TableCell>
              <TableCell>
                <Badge>Active</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Budi</TableCell>
              <TableCell>
                <Badge tone="warn">Invited</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
