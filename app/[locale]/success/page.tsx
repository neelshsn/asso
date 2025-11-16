import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/navigation";

export default async function SuccessPage() {
  const t = await getTranslations("success");
  const sections = [
    {
      key: "volunteer",
      title: t("volunteer.title"),
      description: t("volunteer.description"),
    },
    {
      key: "association",
      title: t("association.title"),
      description: t("association.description"),
    },
  ];

  return (
    <section className="bg-gradient-to-b from-cream to-white py-16">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 rounded-[32px] bg-white/90 p-10 text-center shadow-[0_30px_120px_rgba(0,0,0,0.08)]">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-turquoise">
            {t("eyebrow")}
          </p>
          <h1 className="font-display text-4xl text-ink">{t("title")}</h1>
          <p className="text-ink/70 text-lg">{t("subtitle")}</p>
        </div>
        <div className="grid gap-4 text-left md:grid-cols-2">
          {sections.map((section) => (
            <article
              key={section.key}
              className="border-ink/10 bg-cream/40 rounded-3xl border px-5 py-6"
            >
              <h2 className="text-lg font-semibold text-ink">
                {section.title}
              </h2>
              <p className="text-ink/70 mt-2 text-sm">{section.description}</p>
            </article>
          ))}
        </div>
        <p className="text-ink/60 text-sm">{t("reminder")}</p>
        <div>
          <Button
            asChild
            className="rounded-full bg-orange px-8 text-white hover:bg-salmon"
          >
            <Link href="/">{t("cta")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
