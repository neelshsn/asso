import { MatchesBoard, type MatchRow } from "@/components/AdminTables";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MatchesAdminPage() {
  const matches = await prisma.match.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      volunteer: { include: { user: true } },
      opportunity: true,
    },
  });

  const rows: MatchRow[] = matches.map((match) => ({
    id: match.id,
    volunteer: match.volunteer.user.firstName
      ? `${match.volunteer.user.firstName} ${match.volunteer.user.lastName ?? ""}`
      : match.volunteer.user.email,
    opportunity: match.opportunity.title,
    status: match.status,
    score: match.score,
  }));

  return <MatchesBoard rows={rows} />;
}
