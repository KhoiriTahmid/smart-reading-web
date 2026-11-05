import type { InputHTMLAttributes } from "react";
import { cn } from "~/lib/cn";

export function Checkbox({ className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <input
      type="checkbox"
      className={cn("accent-acc size-[18px] cursor-pointer rounded disabled:cursor-not-allowed disabled:opacity-50", className)}
      {...props}
    />
  );
}
