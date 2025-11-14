import { MatchSettingsForm } from "@/components/admin/MatchSettingsForm";
import en from "@/locales/en/common.json";
import { getMatchSettings } from "@/lib/match";

export const dynamic = "force-dynamic";

export default async function SettingsAdminPage() {
  const matchSettings = await getMatchSettings();
  const faqItems = (en.faq?.items ?? []).slice(0, 5);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-3xl border border-white/60 bg-white/95 p-6">
        <h2 className="font-display text-2xl text-ink">Matching rules</h2>
        <MatchSettingsForm initial={matchSettings} />
      </div>
      <div className="rounded-3xl border border-white/60 bg-white/95 p-6">
        <h2 className="font-display text-2xl text-ink">FAQ preview (EN)</h2>
        <ul className="text-ink/80 mt-4 space-y-3 text-sm">
          {faqItems.map((item: { id: string; question: string }) => (
            <li key={item.id}>{item.question}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
