import { LangSwitcher } from "./LangSwitcher";
import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const contact = t("contact");
  const phone = t("phone");

  return (
    <footer className="border-orange/10 border-t bg-white/80">
      <div className="text-ink/80 mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p>{t("text")}</p>
          <p className="text-ink/60 text-xs">
            <span className="font-semibold text-ink">{contact}</span>{" "}
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="text-orange underline"
            >
              {phone}
            </a>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-orange" aria-label={t("legal")}>
            {t("legal")}
          </a>
          <a href="#" className="hover:text-orange" aria-label={t("privacy")}>
            {t("privacy")}
          </a>
          <LangSwitcher />
        </div>
      </div>
    </footer>
  );
}
