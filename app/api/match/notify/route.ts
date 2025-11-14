import { requireAdminSession } from "@/lib/auth";
import { notifyMatches } from "@/lib/match";
import { NextResponse } from "next/server";

export async function POST() {
  await requireAdminSession();
  const result = await notifyMatches();
  return NextResponse.json(result);
}
