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
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/50 bg-white/95 shadow-[0_-12px_45px_rgba(15,23,42,0.18)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
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
                  "flex flex-1 items-center justify-center gap-2 border-b-2 border-transparent px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition",
                  isActive
                    ? "border-orange text-orange"
                    : "text-ink/60 hover:text-ink",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
