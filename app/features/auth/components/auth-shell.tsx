import { BookOpen, Headphones, History, ScanText } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "~/components/layout/language-switcher";
import { ThemeToggle } from "~/components/layout/theme-toggle";

const features = [
  { key: "ocr", icon: ScanText },
  { key: "device", icon: Headphones },
  { key: "history", icon: History },
] as const;

export function AuthShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="bg-bg text-ink min-h-dvh lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#0b0f14] text-white lg:flex lg:flex-col lg:justify-between lg:p-8 xl:p-12 2xl:p-14">
        <div
          aria-hidden
          className="absolute -top-32 -right-24 size-[28rem] rounded-full bg-emerald-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -left-24 size-[26rem] rounded-full bg-indigo-500/15 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:44px_44px]"
        />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-emerald-400 text-emerald-950">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="text-[15px] font-bold tracking-tight">
                {t("auth.brand.name")}
              </p>
              <p className="text-xs text-white/50">{t("auth.brand.tagline")}</p>
            </div>
          </div>

          <div className="mt-14 max-w-md xl:mt-20">
            <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-emerald-300 uppercase">
              {t("auth.hero.eyebrow")}
            </span>
            <h1 className="mt-5 text-[2.5rem] leading-[1.12] font-bold tracking-tight xl:text-[2.9rem]">
              {t("auth.hero.title")}
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              {t("auth.hero.description")}
            </p>
          </div>

          <div className="mt-10 flex max-w-md flex-col gap-3 xl:mt-12">
            {features.map(({ key, icon: Icon }) => (
              <div
                key={key}
                className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.035] p-3.5 backdrop-blur-sm xl:p-4"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-emerald-300">
                  <Icon className="size-[18px]" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {t(`auth.hero.features.${key}.title`)}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/50">
                    {t(`auth.hero.features.${key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative mt-8 hidden text-xs text-white/35 xl:block">
          {t("auth.hero.footer", { year: new Date().getFullYear() })}
        </p>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between gap-4 px-5 py-5 md:px-8">
          <div className="flex items-center gap-2.5 lg:invisible">
            <div className="bg-ink text-bg grid size-9 place-items-center rounded-xl">
              <BookOpen className="size-[18px]" />
            </div>
            <span className="text-[15px] font-bold tracking-tight">
              {t("auth.brand.name")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex flex-1 items-start justify-center px-5 pt-2 pb-10 sm:items-center sm:pt-0">
          <div className="w-full max-w-[430px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
