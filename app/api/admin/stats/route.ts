import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  await requireAdminSession();
  try {
    const [volunteers, associations, opportunities, matches] =
      await Promise.all([
        prisma.volunteerProfile.count(),
        prisma.associationProfile.count(),
        prisma.opportunity.count({ where: { active: true } }),
        prisma.match.count(),
      ]);

    return NextResponse.json({
      volunteers,
      associations,
      opportunities,
      matches,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
