import type { HTMLAttributes } from "react";
import { cn } from "~/lib/cn";

export type BadgeTone = "ok" | "warn" | "bad" | "info" | "neutral";

const tones: Record<BadgeTone, string> = {
  ok: "bg-accbg text-acc",
  warn: "bg-warnbg text-warn",
  bad: "bg-badbg text-bad",
  info: "bg-infobg text-info",
  neutral: "bg-soft text-mute",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

export function Badge({ tone = "ok", dot = true, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
