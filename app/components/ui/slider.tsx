import type { InputHTMLAttributes } from "react";
import { cn } from "~/lib/cn";

interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  value: number;
  onValueChange: (value: number) => void;
  /** Fires when the user releases the thumb (or key). Send the device command here. */
  onValueCommit?: (value: number) => void;
}

export function Slider({ value, onValueChange, onValueCommit, className, ...props }: SliderProps) {
  return (
    <input
      type="range"
      value={value}
      onChange={(e) => onValueChange(e.currentTarget.valueAsNumber)}
      onPointerUp={(e) => onValueCommit?.(e.currentTarget.valueAsNumber)}
      onKeyUp={(e) => onValueCommit?.(e.currentTarget.valueAsNumber)}
      className={cn("accent-acc h-1.5 w-full cursor-pointer disabled:opacity-50", className)}
      {...props}
    />
  );
}
