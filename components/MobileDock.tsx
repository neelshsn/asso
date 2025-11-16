"use client";

import { Link, usePathname } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { CircleHelp, Handshake, Home, LogIn, Building2 } from "lucide-react";

const navItems = [
  { key: "home", href: "/", icon: Home },
  { key: "faq", href: "/faq", icon: CircleHelp },
  { key: "volunteer", href: "/volunteer", icon: Handshake },
  { key: "association", href: "/association", icon: Building2 },
  { key: "login", href: "/login", icon: LogIn },
] as const;

export function MobileDock() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const rawSegments = pathname?.split("/").filter(Boolean) ?? [];
  const pathWithoutLocale =
    rawSegments.length > 1 ? `/${rawSegments.slice(1).join("/")}` : "/";

  return (
    <nav aria-label={t("mobileMenu")} className="md:hidden">
      <div className="from-cream via-cream/80 pointer-events-none fixed inset-x-0 bottom-0 z-30 h-28 bg-gradient-to-t to-transparent" />
      <div className="fixed bottom-4 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-4">
        <div className="pointer-events-auto flex items-center justify-between rounded-[32px] border border-white/70 bg-white/90 px-3 py-2 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_25px_80px_rgba(15,23,42,0.2)] backdrop-blur-xl">
          {navItems.map((item) => {
            const targetPath = item.href === "/" ? "/" : item.href;
            const isActive =
              targetPath === "/"
                ? pathWithoutLocale === "/"
                : pathWithoutLocale.startsWith(targetPath);
            const Icon = item.icon;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 text-[11px] font-medium leading-tight transition",
                  isActive
                    ? "text-ink"
                    : "text-ink/50 hover:text-ink hover:opacity-90",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-2xl border transition",
                    isActive
                      ? "border-orange/30 bg-orange/10 text-orange"
                      : "text-ink/60 border-transparent",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
