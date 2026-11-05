import { ArrowLeft, Compass, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

interface NotFoundPageProps {
  homeTo?: string | null;
  fullScreen?: boolean;
}

export function NotFoundPage({
  homeTo = "/",
  fullScreen = false,
}: NotFoundPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      className={
        fullScreen
          ? "bg-bg text-ink flex min-h-dvh items-center justify-center p-6"
          : "flex min-h-[60vh] items-center justify-center py-10"
      }
    >
      <Card className="flex max-w-md flex-col items-center gap-4 p-8 text-center">
        <div className="bg-accbg text-acc grid size-14 place-items-center rounded-2xl">
          <Compass className="size-7" />
        </div>

        <Badge tone="warn">404</Badge>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold tracking-tight">
            {t("notFound.title", { defaultValue: "Page Not Found" })}
          </h2>
          <p className="text-mute text-sm leading-relaxed">
            {t("notFound.description", {
              defaultValue:
                "The page you are looking for doesn't exist or you don't have permission to access it.",
            })}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2.5">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
            {t("notFound.goBack", { defaultValue: "Go Back" })}
          </Button>
          {homeTo && (
            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate(homeTo, { replace: true })}
            >
              <Home className="size-4" />
              {t("notFound.backHome", { defaultValue: "Back to Home" })}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
