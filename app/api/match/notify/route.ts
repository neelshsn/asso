import { notifyMatches } from "@/lib/match";
import { NextResponse } from "next/server";

export async function POST() {
  const result = await notifyMatches();
  return NextResponse.json(result);
}
