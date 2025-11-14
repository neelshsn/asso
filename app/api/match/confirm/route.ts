import { confirmMatch } from "@/lib/match";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const action = searchParams.get("action") as "accept" | "decline" | null;

  if (!token || !action) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const result = await confirmMatch(
    token,
    action === "accept" ? "accept" : "decline",
  );
  return NextResponse.json(result);
}
