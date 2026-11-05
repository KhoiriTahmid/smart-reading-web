import { cn } from "~/lib/cn";

export function Progress({ value, className }: { value: number; className?: string }) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("bg-soft h-1.5 overflow-hidden rounded-full", className)}
    >
      <div className="bg-acc h-full rounded-full transition-[width] duration-200" style={{ width: `${v}%` }} />
    </div>
  );
}
