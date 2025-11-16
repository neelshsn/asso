"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const panels = [
  {
    key: "volunteer",
    href: "/volunteer",
    image: "/images/volunteer-hero.jpg",
  },
  {
    key: "association",
    href: "/association",
    image: "/images/association-hero.jpg",
  },
] as const;

export function Hero() {
  const t = useTranslations("hero");

  const scrollToWho = () => {
    const target = document.getElementById("who");
    target?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative isolate flex min-h-[100dvh] w-full flex-col overflow-hidden bg-black text-white md:h-[100dvh] md:min-h-[720px]">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/0 to-transparent" />
      <div className="flex flex-1 flex-col md:flex-row">
        {panels.map((panel) => {
          const isAssociation = panel.key === "association";
          return (
            <article
              key={panel.key}
              className="relative flex flex-1 items-stretch overflow-hidden"
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(120deg, rgba(0,0,0,0.8), rgba(0,0,0,0.35)), url(${panel.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              {!isAssociation ? (
                <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-l from-black/50 via-transparent to-transparent md:block" />
              ) : (
                <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-black/50 via-transparent to-transparent md:block" />
              )}
              <div
                className={cn(
                  "relative z-10 flex w-full flex-col px-8 pb-16 pt-24 sm:px-14",
                  isAssociation
                    ? "items-end text-right"
                    : "items-start text-left",
                )}
              >
                <div
                  className={cn(
                    "flex w-full max-w-xl flex-col gap-4",
                    isAssociation
                      ? "items-end text-right"
                      : "items-start text-left",
                  )}
                >
                  <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                    {isAssociation ? t("secondaryCta") : t("eyebrow")}
                  </p>
                  <h1 className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
                    {isAssociation ? t("titleRest") : t("titleHighlight")}
                  </h1>
                  <p className="text-base text-white/85 sm:text-lg">
                    {isAssociation
                      ? t("subtitleAssociation")
                      : t("subtitleVolunteer")}
                  </p>
                  <div
                    className={cn(
                      "mt-6 flex w-full",
                      isAssociation ? "justify-end" : "justify-start",
                    )}
                  >
                    <Button
                      asChild
                      size="lg"
                      className="rounded-full border border-white/20 bg-orange px-10 text-base font-semibold uppercase tracking-wide text-white shadow-[0_20px_60px_rgba(247,44,91,0.35)] transition hover:scale-105 hover:bg-turquoise"
                    >
                      <Link href={panel.href}>
                        {isAssociation ? t("secondaryCta") : t("primaryCta")}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <motion.button
        type="button"
        onClick={scrollToWho}
        className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/60 bg-white p-4 text-ink shadow-lg"
        animate={{ y: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        aria-label="Scroll to discover more"
      >
        <ChevronDown className="h-6 w-6" />
      </motion.button>
    </section>
  );
}
