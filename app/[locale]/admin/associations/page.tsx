import {
  AssociationsTable,
  type AssociationRow,
} from "@/components/AdminTables";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type AssociationWithUser = {
  id: string;
  orgName: string;
  website: string | null;
  approved: boolean;
  user: { email: string };
};

export default async function AssociationsAdminPage() {
  const associations = await prisma.associationProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const rows: AssociationRow[] = associations.map(
    (assoc: AssociationWithUser) => ({
      id: assoc.id,
      orgName: assoc.orgName,
      email: assoc.user.email,
      website: assoc.website,
      approved: assoc.approved,
    }),
  );

  return <AssociationsTable rows={rows} />;
}
