import { Link } from "@/lib/navigation";
import { getTranslations } from "next-intl/server";

const tabs = [
  { href: "/admin", key: "overview" },
  { href: "/admin/volunteers", key: "volunteers" },
  { href: "/admin/associations", key: "associations" },
  { href: "/admin/opportunities", key: "opportunities" },
  { href: "/admin/matches", key: "matches" },
  { href: "/admin/settings", key: "settings" },
];

export async function AdminNav() {
  const t = await getTranslations("admin.tabs");

  return (
    <nav className="mb-8 flex flex-wrap gap-3">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className="border-teal/30 hover:bg-teal/10 rounded-full border px-4 py-2 text-sm font-medium text-ink transition"
        >
          {t(tab.key)}
        </Link>
      ))}
    </nav>
  );
}
