"use client";

import { useTranslations } from "next-intl";
import { Share2, Sparkles, Link2 } from "lucide-react";

const iconMap = {
  Share2,
  Sparkles,
  Link2,
};

type Step = {
  title: string;
  description: string;
  icon: keyof typeof iconMap;
};

export function HowItWorks() {
  const t = useTranslations("how");
  const steps = t.raw("steps") as Step[];

  return (
    <section className="border-turquoise/15 bg-beige/50 mt-16 rounded-[36px] border p-10 shadow-card">
      <h2 className="font-display text-3xl text-ink">{t("title")}</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = iconMap[step.icon] ?? Sparkles;
          return (
            <div
              key={step.title}
              className="border-orange/10 relative overflow-hidden rounded-3xl border bg-white/90 p-6"
            >
              <span className="text-orange/10 absolute -right-4 -top-4 font-display text-8xl">
                0{index + 1}
              </span>
              <div className="flex items-center gap-3">
                <span className="bg-orange/15 flex h-12 w-12 items-center justify-center rounded-2xl text-orange">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-turquoise">
                  Step {index + 1}
                </p>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-ink">
                {step.title}
              </h3>
              <p className="text-ink/75 mt-2">{step.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
