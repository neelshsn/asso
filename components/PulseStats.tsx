import Image from "next/image";
import { getTranslations } from "next-intl/server";

const instagramPosts = [
  {
    id: "jeanne-reel-1",
    url: "https://www.instagram.com/p/DLxe1ZeyPA_/",
    label: "Reel 1",
  },
  {
    id: "jeanne-reel-2",
    url: "https://www.instagram.com/p/DL5Ka50SAnE/",
    label: "Reel 2",
  },
  {
    id: "jeanne-reel-3",
    url: "https://www.instagram.com/p/DQuPy54Df0h/",
    label: "Reel 3",
  },
] as const;

export async function PulseStats() {
  const t = await getTranslations("jeanne");
  const paragraphs = (t.raw("paragraphs") as string[]) ?? [];

  return (
    <section className="border-orange/10 mx-auto w-full max-w-6xl space-y-10 rounded-[36px] border bg-white/95 p-8 shadow-card backdrop-blur">
      <article className="flex flex-col gap-8 md:flex-row md:items-center">
        <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[32px] bg-cream shadow-lg md:max-w-[320px]">
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

      <div className="flex justify-end">
        <a
          href="https://www.instagram.com/jeannebrantus/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-white/85 text-orange shadow-card transition hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.35 3.608 1.325.975.975 1.263 2.242 1.325 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.35 2.633-1.325 3.608-.975.975-2.242 1.263-3.608 1.325-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.35-3.608-1.325-.975-.975-1.263-2.242-1.325-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.35-2.633 1.325-3.608.975-.975 2.242-1.263 3.608-1.325 1.266-.058 1.646-.07 4.85-.07Zm0-2.163C8.735 0 8.332.014 7.052.072 5.775.13 4.638.37 3.678 1.33c-.96.96-1.2 2.097-1.258 3.374C2.362 5.984 2.348 6.387 2.348 12s.014 6.016.072 7.296c.058 1.277.298 2.414 1.258 3.374.96.96 2.097 1.2 3.374 1.258C8.332 23.986 8.735 24 12 24s3.668-.014 4.948-.072c1.277-.058 2.414-.298 3.374-1.258.96-.96 1.2-2.097 1.258-3.374.058-1.28.072-1.683.072-7.296s-.014-6.016-.072-7.296c-.058-1.277-.298-2.414-1.258-3.374-.96-.96-2.097-1.2-3.374-1.258C15.668.014 15.265 0 12 0Z" />
            <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324Zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" />
          </svg>
          <span className="sr-only">Instagram</span>
        </a>
      </div>

      <div className="hide-scrollbar text-ink/70 mt-4 flex gap-4 overflow-x-auto pb-4">
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
              <p className="text-sm font-medium text-ink">{post.label}</p>
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
    </section>
  );
}
