import { VolunteersTable, type VolunteerRow } from "@/components/AdminTables";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type VolunteerWithUser = {
  id: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  skills: unknown;
  causes: unknown;
  approved: boolean;
  lastProposalAt: Date | null;
};

function toArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item: unknown) => (typeof item === "string" ? item : ""))
    .filter(Boolean);
}

export default async function VolunteersAdminPage() {
  const volunteers = await prisma.volunteerProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const rows: VolunteerRow[] = volunteers.map(
    (vol: VolunteerWithUser): VolunteerRow => ({
      id: vol.id,
      name:
        `${vol.user.firstName ?? ""} ${vol.user.lastName ?? ""}`.trim() ||
        vol.user.email,
      email: vol.user.email,
      skills: toArray(vol.skills),
      causes: toArray(vol.causes),
      approved: vol.approved,
      lastProposalAt: vol.lastProposalAt?.toISOString() ?? null,
    }),
  );

  return <VolunteersTable rows={rows} />;
}
