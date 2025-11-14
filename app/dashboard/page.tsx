import { DashboardActions } from "@/components/dashboard/DashboardActions";
import { MiniTrend } from "@/components/Charts";
import { prisma } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { Toaster } from "sonner";

export const dynamic = "force-dynamic";

const statusOrder = ["PROPOSED", "ACCEPTED", "DECLINED", "EXPIRED"] as const;
const modalityOrder = ["ONSITE", "REMOTE", "HYBRID"] as const;

function toArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

export default async function DashboardPage() {
  let volunteers = 0;
  let associations = 0;
  let opportunities = 0;
  let matches = 0;
  let trendSource: { createdAt: Date; score: number }[] = [];
  let statusGroups: {
    status: (typeof statusOrder)[number];
    _count: { _all: number };
  }[] = [];
  let modalityGroups: {
    modality: (typeof modalityOrder)[number];
    _count: { _all: number };
  }[] = [];
  let recentVolunteers: {
    id: string;
    createdAt: Date;
    user: { firstName: string | null; email: string; languages: unknown };
  }[] = [];

  try {
    [
      volunteers,
      associations,
      opportunities,
      matches,
      trendSource,
      statusGroups,
      modalityGroups,
      recentVolunteers,
    ] = await Promise.all([
      prisma.volunteerProfile.count(),
      prisma.associationProfile.count(),
      prisma.opportunity.count(),
      prisma.match.count(),
      prisma.match.findMany({
        orderBy: { createdAt: "asc" },
        take: 12,
        select: { createdAt: true, score: true },
      }),
      prisma.match.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.opportunity.groupBy({ by: ["modality"], _count: { _all: true } }),
      prisma.volunteerProfile.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        include: { user: true },
      }),
    ]);
  } catch (error) {
    console.warn("Dashboard falling back to zeroed stats:", error);
  }

  const trendData = trendSource.map((entry) => ({
    label: entry.createdAt.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    value: entry.score,
  }));

  const statusData = statusOrder.map((status) => {
    const group = statusGroups.find((item) => item.status === status);
    return { status, value: group?._count._all ?? 0 };
  });

  const modalityData = modalityOrder.map((modality) => {
    const group = modalityGroups.find((item) => item.modality === modality);
    return { modality, value: group?._count._all ?? 0 };
  });

  const totalMatches = statusData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="bg-cream text-ink">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.4em] text-turquoise">
            Dashboard
          </p>
          <h1 className="font-display text-3xl md:text-4xl">
            Impact operations overview
          </h1>
          <p className="text-ink/70 max-w-2xl">
            Live stats about volunteers, associations, and matching health. No
            login required - simply monitor progress and trigger workflows when
            needed.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Volunteers", value: volunteers },
            { label: "Associations", value: associations },
            { label: "Opportunities", value: opportunities },
            { label: "Matches", value: matches },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border-orange/15 rounded-[28px] border bg-white/90 p-5 shadow-card"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-turquoise">
                {stat.label}
              </p>
              <p className="font-display text-4xl text-ink">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="border-orange/15 rounded-[32px] border bg-white/95 p-6 shadow-card">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-2xl text-ink">
                Matching velocity
              </h2>
              <p className="text-ink/60 text-sm">
                Scores across recent proposals
              </p>
            </div>
            <DashboardActions />
          </div>
          <MiniTrend data={trendData} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="border-orange/15 rounded-[32px] border bg-white/95 p-6 shadow-card">
            <h3 className="font-display text-xl text-ink">Match pipeline</h3>
            <div className="mt-4 space-y-4">
              {statusData.map((item) => (
                <div key={item.status}>
                  <div className="text-ink/80 flex items-center justify-between text-sm">
                    <span>{item.status}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="bg-orange/10 mt-2 h-2 rounded-full">
                    <div
                      className="h-2 rounded-full bg-orange"
                      style={{
                        width: `${totalMatches ? (item.value / totalMatches) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-ink/70 mt-6 grid grid-cols-3 gap-3 text-center text-xs">
              {modalityData.map((item) => (
                <div
                  key={item.modality}
                  className="border-orange/20 rounded-full border px-3 py-2"
                >
                  <p className="font-semibold text-ink">{item.value}</p>
                  <p>{item.modality}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-orange/15 rounded-[32px] border bg-white/95 p-6 shadow-card">
            <h3 className="font-display text-xl text-ink">Latest volunteers</h3>
            <ul className="mt-4 space-y-4">
              {recentVolunteers.map((vol) => {
                const languages = toArray(vol.user.languages);
                const displayName =
                  vol.user.firstName?.trim() || vol.user.email.split("@")[0];
                return (
                  <li
                    key={vol.id}
                    className="border-orange/10 bg-beige/40 flex items-center justify-between rounded-2xl border px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-ink">{displayName}</p>
                      <p className="text-ink/60 text-xs">
                        {languages.join(", ") || "Languages TBD"}
                      </p>
                    </div>
                    <p className="text-ink/60 text-xs">
                      {formatDistanceToNow(vol.createdAt, { addSuffix: true })}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      <Toaster richColors position="top-right" duration={4000} />
    </div>
  );
}
