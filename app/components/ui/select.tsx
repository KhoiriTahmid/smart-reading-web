import { Check, ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

interface BaseProps {
  options: SelectOption[];
  placeholder?: ReactNode;
  disabled?: boolean;
  className?: string;
  /** Jumlah tag yang ditampilkan di mode multiple, sisanya jadi "+N" */
  maxTagCount?: number;
  "aria-label"?: string;
}

interface SingleProps extends BaseProps {
  mode?: "single";
  value?: string;
  onChange?: (value: string) => void;
}

interface MultipleProps extends BaseProps {
  mode: "multiple";
  value?: string[];
  onChange?: (value: string[]) => void;
}

export type SelectProps = SingleProps | MultipleProps;

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

interface MenuPosition {
  top: number;
  left: number;
  width: number;
}

export function Select(props: SelectProps) {
  const {
    options,
    placeholder = "—",
    disabled,
    className,
    maxTagCount = 2,
    "aria-label": ariaLabel,
  } = props;

  const isMultiple = props.mode === "multiple";
  const selected: string[] = isMultiple
    ? (props.value ?? [])
    : props.value
      ? [props.value]
      : [];

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pos, setPos] = useState<MenuPosition | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  // ---------- posisi dropdown (portal + fixed, supaya tidak ke-clip overflow-x-auto) ----------
  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left, width: r.width });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  // ---------- tutup saat klik di luar ----------
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // ---------- pilih opsi ----------
  const commit = (opt: SelectOption) => {
    if (opt.disabled) return;
    if (props.mode === "multiple") {
      const next = selected.includes(opt.value)
        ? selected.filter((v) => v !== opt.value)
        : [...selected, opt.value];
      props.onChange?.(next);
    } else {
      props.onChange?.(opt.value);
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const openMenu = () => {
    if (disabled) return;
    const first = options.findIndex((o) => selected.includes(o.value));
    setActiveIndex(first >= 0 ? first : 0);
    setOpen(true);
  };

  // ---------- keyboard ----------
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        if (!open) return openMenu();
        const dir = e.key === "ArrowDown" ? 1 : -1;
        setActiveIndex((i) => (i + dir + options.length) % options.length);
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        if (!open) return openMenu();
        const opt = options[activeIndex];
        if (opt) commit(opt);
        break;
      }
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  // ---------- tampilan di trigger ----------
  const labelOf = (v: string) =>
    options.find((o) => o.value === v)?.label ?? v;

  const renderValue = () => {
    if (selected.length === 0) {
      return <span className="text-mute truncate">{placeholder}</span>;
    }
    if (!isMultiple) {
      return <span className="truncate">{labelOf(selected[0])}</span>;
    }
    const shown = selected.slice(0, maxTagCount);
    const rest = selected.length - shown.length;
    return (
      <span className="flex min-w-0 flex-wrap items-center gap-1">
        {shown.map((v) => (
          <span
            key={v}
            className="bg-muted rounded px-1.5 py-0.5 text-xs leading-none whitespace-nowrap"
          >
            {labelOf(v)}
          </span>
        ))}
        {rest > 0 && (
          <span className="text-mute text-xs whitespace-nowrap">+{rest}</span>
        )}
      </span>
    );
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={cx(
          "border-border bg-card flex min-h-9 w-full items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm",
          "focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      >
        {renderValue()}
        <ChevronDown
          className={cx(
            "text-mute size-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open &&
        pos &&
        createPortal(
          <ul
            ref={menuRef}
            id={listId}
            role="listbox"
            aria-multiselectable={isMultiple || undefined}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              minWidth: pos.width,
            }}
            className="border-border bg-card z-50 max-h-60 overflow-auto rounded-md border p-1 shadow-lg"
          >
            {options.map((opt, i) => {
              const isSelected = selected.includes(opt.value);
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled || undefined}
                  onMouseEnter={() => setActiveIndex(i)}
                  // mousedown + preventDefault: fokus tetap di trigger
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => commit(opt)}
                  className={cx(
                    "flex cursor-pointer items-center justify-between gap-3 rounded px-2 py-1.5 text-sm",
                    i === activeIndex && "bg-muted",
                    isSelected && "font-medium",
                    opt.disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="size-4 shrink-0" />}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </>
  );
}