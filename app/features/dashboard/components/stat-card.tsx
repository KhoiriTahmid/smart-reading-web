import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/cn";

export type StatTone = "ok" | "warn" | "bad" | "info" | "neutral";

const iconTone: Record<StatTone, string> = {
  ok: "bg-accbg text-acc",
  warn: "bg-warnbg text-warn",
  bad: "bg-badbg text-bad",
  info: "bg-infobg text-info",
  neutral: "bg-soft text-mute",
};

interface StatCardProps {
  label: string;
  title: ReactNode;
  subtitle?: ReactNode;
  icon: LucideIcon;
  tone?: StatTone;
  footerLabel: string;
  footer: ReactNode;
}

export function StatCard({ label, title, subtitle, icon: Icon, tone = "neutral", footerLabel, footer }: StatCardProps) {
  return (
    <Card className="flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-mute text-[11px] font-semibold tracking-wider uppercase">{label}</p>
          <p className="mt-1.5 truncate text-lg font-bold">{title}</p>
          {subtitle && <p className="text-mute mt-0.5 truncate font-mono text-xs">{subtitle}</p>}
        </div>
        <div className={cn("grid size-10 shrink-0 place-items-center rounded-xl", iconTone[tone])}>
          <Icon className="size-[18px]" />
        </div>
      </div>
      <div className="border-line text-mute flex items-center justify-between border-t pt-3 text-xs">
        <span>{footerLabel}</span>
        {footer}
      </div>
    </Card>
  );
}
