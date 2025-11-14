import { requireAdminSession } from "@/lib/auth";
import { notifyMatches, runMatching } from "@/lib/match";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await requireAdminSession();
  const body = request.body ? await request.json().catch(() => ({})) : {};
  const relaxed = Boolean(body?.relaxed);
  const result = await runMatching({ relaxed });
  if (result.matchIds?.length) {
    await notifyMatches(result.matchIds);
  }
  return NextResponse.json(result);
}
