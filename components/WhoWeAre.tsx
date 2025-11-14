"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const sections = [
  {
    key: "volunteer",
    image: "/images/who-volunteer.jpg",
  },
  {
    key: "association",
    image: "/images/who-association.jpg",
  },
  {
    key: "goal",
    image: "/images/who-goal.jpg",
  },
] as const;

export function WhoWeAre() {
  const t = useTranslations("who");

  return (
    <section
      id="who"
      className="border-orange/10 w-full scroll-mt-24 rounded-[32px] border bg-white/70 shadow-card"
    >
      <h2 className="px-6 pt-8 font-display text-3xl text-ink sm:px-12">
        {t("title")}
      </h2>
      <div className="mt-6 grid overflow-hidden rounded-b-[32px] md:grid-cols-3">
        {sections.map((section, idx) => (
          <motion.article
            key={section.key}
            className="border-orange/10 relative min-h-[320px] border-t p-6 text-white md:border-l"
            style={{
              backgroundImage: `linear-gradient(120deg, rgba(0,0,0,0.65), rgba(0,0,0,0.15)), url(${section.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.6 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="flex h-full flex-col justify-end">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                {t(`sections.${section.key}.eyebrow`)}
              </p>
              <h3 className="mt-2 text-2xl font-bold">
                {t(`sections.${section.key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-white/85">
                {t(`sections.${section.key}.body`)}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
