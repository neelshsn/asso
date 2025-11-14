import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/navigation";

type Stat = { label: string; value: string };

export async function PulseStats() {
  const t = await getTranslations("pulse");
  const stats = (t.raw("stats") as Stat[]) ?? [];

  return (
    <section className="border-orange/15 mx-auto w-full max-w-6xl rounded-[36px] border bg-white/90 p-8 shadow-card backdrop-blur">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-turquoise">
            {t("title")}
          </p>
          <p className="text-ink/70 mt-2 max-w-2xl">{t("subtitle")}</p>
        </div>
        <Button
          asChild
          className="shadow-orange/30 rounded-full bg-orange text-white shadow-lg hover:bg-turquoise"
        >
          <Link href="#contact">{t("cta")}</Link>
        </Button>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-orange/10 from-orange/5 to-beige/40 rounded-3xl border bg-gradient-to-br via-white p-6 text-center shadow-inner"
          >
            <p className="font-display text-4xl text-ink">{stat.value}</p>
            <p className="text-ink/60 mt-2 text-sm uppercase tracking-[0.2em]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
