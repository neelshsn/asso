import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export async function ContactPanel() {
  const contact = await getTranslations("contactPanel");
  const footer = await getTranslations("footer");
  const phone = footer("phone");

  return (
    <section
      id="contact"
      className="border-orange/20 from-orange/20 via-salmon/10 to-beige/40 mx-auto w-full max-w-6xl overflow-hidden rounded-[48px] border bg-gradient-to-br p-10 text-ink shadow-[0_30px_80px_rgba(255,79,15,0.25)]"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-turquoise">
            {contact("title")}
          </p>
          <p className="mt-3 max-w-2xl text-lg text-ink">
            {contact("subtitle")}
          </p>
        </div>
        <div className="text-ink/80 flex flex-col gap-3 text-sm">
          <Button
            asChild
            className="shadow-orange/30 rounded-full bg-orange px-8 text-white shadow-lg hover:bg-turquoise"
          >
            <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a>
          </Button>
          <Button
            variant="outline"
            asChild
            className="border-orange/40 rounded-full text-ink hover:text-orange"
          >
            <a href="mailto:contact@ngo.local">{contact("cta")}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
