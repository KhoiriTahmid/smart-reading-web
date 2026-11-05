import { useLanguage, type Lang } from "~/hooks/use-language";
import { cn } from "~/lib/cn";

const options: { value: Lang; label: string }[] = [
  { value: "id", label: "ID" },
  { value: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="bg-soft inline-flex rounded-lg p-0.5" role="group" aria-label="Language">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={lang === o.value}
          onClick={() => setLang(o.value)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
            lang === o.value ? "bg-card text-ink shadow-sm" : "text-mute hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
