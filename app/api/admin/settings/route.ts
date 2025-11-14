import { requireAdminSession } from "@/lib/auth";
import { getMatchSettings, saveMatchSettings } from "@/lib/match";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  threshold: z.number().min(0).max(100),
  weights: z.object({
    skills: z.number(),
    causes: z.number(),
    availability: z.number(),
    language: z.number(),
    modality: z.number(),
  }),
});

export async function GET() {
  await requireAdminSession();
  const settings = await getMatchSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  await requireAdminSession();
  const payload = schema.parse(await request.json());
  await saveMatchSettings(payload);
  return NextResponse.json({ ok: true });
}
