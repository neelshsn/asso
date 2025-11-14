import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/navigation";

export default async function SuccessPage() {
  const t = await getTranslations("success");

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center rounded-3xl bg-white/90 p-12 text-center shadow-card">
      <h1 className="text-teal font-display text-4xl">{t("title")}</h1>
      <p className="text-ink/80 mt-4 text-lg">{t("subtitle")}</p>
      <Button asChild className="bg-teal hover:bg-pink mt-8 rounded-full">
        <Link href="/">{t("cta")}</Link>
      </Button>
    </div>
  );
}
