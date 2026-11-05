import { BookOpen, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LoadingScreen() {
  const { t } = useTranslation();

  return (
    <div className="bg-bg text-ink flex min-h-dvh flex-col items-center justify-center gap-5">
      <div className="bg-ink text-bg grid size-14 place-items-center rounded-2xl">
        <BookOpen className="size-7" />
      </div>
      <div className="flex items-center gap-2 text-sm text-mute">
        <Loader2 className="size-4 animate-spin" />
        <span>{t("auth.loading")}</span>
      </div>
    </div>
  );
}
