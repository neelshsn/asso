import Image from "next/image";
import { getTranslations } from "next-intl/server";

const instagramPosts = [
  {
    id: "jeanne-reel-1",
    url: "https://www.instagram.com/p/DL5Ka50SAnE/",
  },
  {
    id: "jeanne-reel-2",
    url: "https://www.instagram.com/p/DQuPy54Df0h/",
  },
  {
    id: "jeanne-reel-3",
    url: "https://www.instagram.com/p/DQuPy54Df0h/",
  },
] as const;

export async function PulseStats() {
  const t = await getTranslations("jeanne");
  const paragraphs = (t.raw("paragraphs") as string[]) ?? [];

  return (
    <section className="border-orange/10 mx-auto w-full max-w-6xl space-y-10 rounded-[36px] border bg-white/95 p-8 shadow-card backdrop-blur">
      <article className="flex flex-col gap-8 md:flex-row md:items-center">
        <div className="bg-cream relative mx-auto w-full max-w-sm overflow-hidden rounded-[32px] shadow-lg md:max-w-[320px]">
          <Image
            src="/images/jeanne.jpg"
            alt={t("imageAlt")}
            width={640}
            height={780}
            className="h-full w-full object-cover"
            priority
          />
        </div>
        <div className="flex-1 space-y-4">
          <p className="text-xs uppercase tracking-[0.5em] text-turquoise">
            {t("eyebrow")}
          </p>
          <div>
            <h2 className="font-display text-3xl text-ink md:text-4xl">
              {t("title")}
            </h2>
            <p className="text-ink/60 text-sm md:text-base">{t("subtitle")}</p>
          </div>
          <div className="text-ink/80 space-y-4 text-base leading-relaxed">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>

      <div className="border-ink/5 bg-cream/60 rounded-[32px] border p-6 shadow-inner">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-turquoise">
              {t("instagram.title")}
            </p>
            <p className="text-ink/70 text-sm">{t("instagram.subtitle")}</p>
          </div>
          <a
            href="https://www.instagram.com/ngo.match/"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-orange hover:underline"
          >
            instagram.com/ngo.match
          </a>
        </div>

        <div className="hide-scrollbar text-ink/70 mt-6 flex gap-4 overflow-x-auto pb-4">
          {instagramPosts.map((post, index) => (
            <div
              key={post.id}
              className="min-w-[260px] max-w-xs flex-1 snap-center rounded-3xl border border-white/60 bg-white/90 shadow-lg"
            >
              <div className="aspect-[9/16] overflow-hidden rounded-t-3xl">
                <iframe
                  src={`${post.url}embed`}
                  title={`Instagram reel ${index + 1}`}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-sm font-medium text-ink">Reel {index + 1}</p>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-orange underline-offset-4 hover:underline"
                >
                  Voir
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
