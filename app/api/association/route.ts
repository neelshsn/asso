import { prisma } from "@/lib/db";
import { sendConfirmationEmail } from "@/lib/mailer";
import { Modality, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  orgName: z.string().min(2),
  email: z.string().email(),
  website: z.string().optional(),
  social: z.string().optional(),
  legalStatus: z.string().optional(),
  missionTitle: z.string().min(2),
  description: z.string().min(10),
  requiredSkills: z.array(z.string()).default([]),
  causes: z.array(z.string()).default([]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  modality: z.nativeEnum(Modality),
  country: z.string().min(2),
  city: z.string().min(2),
  urgency: z.number().min(0).max(10),
  consent: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);

    const user = await prisma.user.create({
      data: {
        role: Role.ASSOCIATION,
        email: payload.email,
        languages: [],
        association: {
          create: {
            orgName: payload.orgName,
            website: payload.website,
            social: payload.social,
            legalStatus: payload.legalStatus,
            shareEmail: payload.consent,
            opportunities: {
              create: {
                title: payload.missionTitle,
                description: payload.description,
                requiredSkills: payload.requiredSkills,
                causes: payload.causes,
                startDate: payload.startDate
                  ? new Date(payload.startDate)
                  : null,
                endDate: payload.endDate ? new Date(payload.endDate) : null,
                modality: payload.modality,
                country: payload.country,
                city: payload.city,
                urgency: payload.urgency,
              },
            },
          },
        },
      },
    });

    await sendConfirmationEmail({ to: user.email, type: "association" });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
