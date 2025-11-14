import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await requireAdminSession();
  const { id, type, approved } = await request.json();

  try {
    if (type === "volunteer") {
      await prisma.volunteerProfile.update({
        where: { id },
        data: { approved },
      });
    } else if (type === "association") {
      await prisma.associationProfile.update({
        where: { id },
        data: { approved },
      });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
