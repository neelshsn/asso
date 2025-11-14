"use client";

import { useTranslations } from "next-intl";
import { Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const cards = [
  {
    key: "volunteer",
    icon: Users,
    gradient: "from-orange/20 via-salmon/10 to-white",
  },
  {
    key: "association",
    icon: Sparkles,
    gradient: "from-turquoise/20 via-beige/50 to-white",
  },
] as const;

export function ValueCards() {
  const t = useTranslations("value");

  return (
    <section className="mt-16 grid gap-6 md:grid-cols-2">
      {cards.map((card, index) => {
        const group = t.raw(`cards.${card.key}`) as {
          title: string;
          description: string;
          items: string[];
        };
        const Icon = card.icon;

        return (
          <motion.article
            key={card.key}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            viewport={{ once: true, amount: 0.4 }}
            className="border-orange/15 group relative overflow-hidden rounded-[32px] border p-8 shadow-card backdrop-blur"
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-70 transition group-hover:opacity-90`}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-orange shadow-inner">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="font-display text-2xl text-ink">
                  {group.title}
                </h3>
              </div>
              <p className="text-ink/80 mt-3">{group.description}</p>
              <ul className="mt-5 space-y-3 text-sm text-ink">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span
                      className="bg-orange/70 mt-1 inline-flex h-2.5 w-2.5 rounded-full"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.article>
        );
      })}
    </section>
  );
}
