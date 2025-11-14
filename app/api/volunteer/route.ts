import { prisma } from "@/lib/db";
import { sendConfirmationEmail } from "@/lib/mailer";
import { AvailabilityType, Modality, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  languages: z.array(z.string()).default([]),
  country: z.string().min(1),
  city: z.string().min(1),
  skills: z.array(z.string()).default([]),
  causes: z.array(z.string()).default([]),
  availability: z.nativeEnum(AvailabilityType),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  modality: z.nativeEnum(Modality),
  preferredCountries: z.array(z.string()).default([]),
  remoteOk: z.boolean().default(false),
  consent: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);

    const user = await prisma.user.create({
      data: {
        role: Role.VOLUNTEER,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        languages: payload.languages,
        country: payload.country,
        city: payload.city,
        volunteer: {
          create: {
            skills: payload.skills,
            causes: payload.causes,
            availability: payload.availability,
            availableFrom: payload.availableFrom
              ? new Date(payload.availableFrom)
              : null,
            availableTo: payload.availableTo
              ? new Date(payload.availableTo)
              : null,
            modality: payload.modality,
            preferredCountries: payload.preferredCountries,
            remoteOk: payload.remoteOk,
            shareEmail: payload.consent,
          },
        },
      },
    });

    await sendConfirmationEmail({ to: user.email, type: "volunteer" });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
