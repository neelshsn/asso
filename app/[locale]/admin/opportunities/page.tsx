import {
  OpportunitiesTable,
  type OpportunityRow,
} from "@/components/AdminTables";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function OpportunitiesAdminPage() {
  const opportunities = await prisma.opportunity.findMany({
    include: { association: true },
    orderBy: { createdAt: "desc" },
  });

  const rows: OpportunityRow[] = opportunities.map((opp) => ({
    id: opp.id,
    title: opp.title,
    association: opp.association.orgName,
    modality: opp.modality,
    urgency: opp.urgency,
    active: opp.active,
  }));

  return <OpportunitiesTable rows={rows} />;
}
