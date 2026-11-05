import {
  useEffect,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Button } from "~/components/ui/button";

type ConfirmButtonProps = Omit<
  ComponentProps<typeof Button>,
  "onClick" | "children"
> & {
  label: ReactNode;
  confirmLabel: ReactNode;
  onConfirm: () => void;
};

/** First click arms the button, second click within 3s fires the action. */
export function ConfirmButton({
  label,
  confirmLabel,
  onConfirm,
  variant,
  ...props
}: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(id);
  }, [armed]);

  return (
    <Button
      {...props}
      variant={armed ? "danger" : variant}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else {
          setArmed(true);
        }
      }}
    >
      {armed ? confirmLabel : label}
    </Button>
  );
}
