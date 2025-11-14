"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CircleHelp,
  Globe2,
  HeartHandshake,
  LifeBuoy,
  MapPin,
  ShieldCheck,
  Users,
  HelpCircle,
  LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  linkHref?: string;
  linkLabel?: string;
}

const ICONS: Partial<Record<string, LucideIcon>> = {
  "what-is-volunteering": HeartHandshake,
  "volunteering-vs-benevolat": Users,
  "ngo-vs-association": Globe2,
  "what-is-voluntourism": ShieldCheck,
  "find-associations": MapPin,
  legitimacy: LifeBuoy,
  "get-advice": HelpCircle,
};

export function FAQ() {
  const t = useTranslations("faq");
  const items = t.raw("items") as FaqItem[];

  return (
    <section
      className="border-orange/10 mt-16 rounded-[32px] border bg-white/80 p-6 shadow-card"
      id="faq"
    >
      <div className="flex items-center gap-3">
        <span className="bg-turquoise/15 flex h-12 w-12 items-center justify-center rounded-2xl text-turquoise">
          <CircleHelp className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-3xl text-ink">{t("title")}</h2>
          <p className="text-ink/70 text-sm">{t("description")}</p>
        </div>
      </div>
      <Accordion type="single" collapsible className="mt-6 space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <AccordionItem
              value={item.id}
              className="border-orange/10 bg-beige/60 rounded-2xl border px-4"
            >
              <AccordionTrigger className="flex items-center gap-3 text-left text-lg font-semibold text-ink">
                <span className="bg-orange/10 flex h-10 w-10 items-center justify-center rounded-full text-orange">
                  {(() => {
                    const Icon = ICONS[item.id] ?? CircleHelp;
                    return <Icon className="h-5 w-5" aria-hidden="true" />;
                  })()}
                </span>
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-ink/80">
                <p>{item.answer}</p>
                {item.linkHref && item.linkLabel ? (
                  <a
                    href={item.linkHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center text-sm text-orange underline"
                  >
                    {item.linkLabel}
                  </a>
                ) : null}
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </section>
  );
}
