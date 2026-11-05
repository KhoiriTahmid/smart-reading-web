import { CircleAlert } from "lucide-react";

export function OrDivider({ label }: { label: string }) {
  return (
    <div className="text-mute flex items-center gap-3 text-[11px] font-semibold tracking-[0.14em] uppercase">
      <span className="bg-line h-px flex-1" />
      <span>{label}</span>
      <span className="bg-line h-px flex-1" />
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="bg-badbg text-bad flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium"
    >
      <CircleAlert className="mt-px size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
