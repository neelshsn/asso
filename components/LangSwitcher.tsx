"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/navigation";
import { locales, localeLabels, type Locale } from "@/lib/i18n/config";
import { useTransition, type ReactElement } from "react";
import { Loader2, Languages } from "lucide-react";
import { cn } from "@/lib/utils";

const localeIcons = locales.reduce<Record<Locale, ReactElement>>(
  (acc, loc) => {
    acc[loc as Locale] = <Languages className="h-4 w-4" />;
    return acc;
  },
  {} as Record<Locale, ReactElement>,
);

export function LangSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 shadow-sm",
        className,
      )}
    >
      {locales.map((loc) => {
        const localeKey = loc as Locale;
        return (
          <button
            key={loc}
            type="button"
            aria-label={localeLabels[localeKey]}
            onClick={() =>
              startTransition(() => {
                router.replace(pathname, { locale: localeKey });
              })
            }
            className={cn(
              "flex items-center gap-1 rounded-full border px-3 py-1 text-xs uppercase transition",
              locale === localeKey
                ? "bg-orange/10 border-orange text-orange"
                : "text-ink/70 hover:border-orange/40 border-transparent",
            )}
          >
            {pending && locale === localeKey ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              localeIcons[localeKey]
            )}
            {localeKey}
          </button>
        );
      })}
    </div>
  );
}
