import { VolunteersTable, type VolunteerRow } from "@/components/AdminTables";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type VolunteerWithUser = Prisma.VolunteerProfileGetPayload<{
  include: { user: true };
}>;

function toArray(value: Prisma.JsonValue | null | undefined): string[] {
  if (!value || !Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item : ""))
    .filter(Boolean);
}

export default async function VolunteersAdminPage() {
  const volunteers = await prisma.volunteerProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const rows: VolunteerRow[] = volunteers.map((vol: VolunteerWithUser) => ({
    id: vol.id,
    name:
      `${vol.user.firstName ?? ""} ${vol.user.lastName ?? ""}`.trim() ||
      vol.user.email,
    email: vol.user.email,
    skills: toArray(vol.skills),
    causes: toArray(vol.causes),
    approved: vol.approved,
    lastProposalAt: vol.lastProposalAt?.toISOString() ?? null,
  }));

  return <VolunteersTable rows={rows} />;
}
