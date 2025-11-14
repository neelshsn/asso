import { PrismaClient, Role, AvailabilityType, Modality } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? "admin@ngo.local";
  const password = process.env.ADMIN_PASSWORD ?? "change-me";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: Role.ADMIN },
    create: {
      email,
      role: Role.ADMIN,
      passwordHash,
      firstName: "Admin",
      lastName: "N'GO",
    },
  });
}

async function seedVolunteers() {
  const volunteers = [
    {
      email: "lea@example.com",
      firstName: "Léa",
      lastName: "Martin",
      languages: ["fr", "en"],
      country: "France",
      city: "Paris",
      skills: ["education", "coordination"],
      causes: ["youth", "education"],
      modality: Modality.HYBRID,
    },
    {
      email: "sami@example.com",
      firstName: "Sami",
      lastName: "Diallo",
      languages: ["fr", "es"],
      country: "Senegal",
      city: "Dakar",
      skills: ["logistics", "procurement"],
      causes: ["health", "operations"],
      modality: Modality.ONSITE,
    },
    {
      email: "maria@example.com",
      firstName: "Maria",
      lastName: "Lopez",
      languages: ["es", "en"],
      country: "Spain",
      city: "Madrid",
      skills: ["communication", "fundraising"],
      causes: ["community", "women"],
      modality: Modality.REMOTE,
    },
  ];

  for (const vol of volunteers) {
    await prisma.user.upsert({
      where: { email: vol.email },
      update: {},
      create: {
        email: vol.email,
        role: Role.VOLUNTEER,
        firstName: vol.firstName,
        lastName: vol.lastName,
        languages: vol.languages,
        country: vol.country,
        city: vol.city,
        volunteer: {
          create: {
            skills: vol.skills,
            causes: vol.causes,
            availability: AvailabilityType.PARTTIME,
            modality: vol.modality,
            preferredCountries: ["France", "Morocco"],
            approved: true,
            remoteOk: vol.modality !== Modality.ONSITE,
          },
        },
      },
    });
  }
}

async function seedAssociations() {
  const associations = [
    {
      email: "care@impact.org",
      orgName: "Impact Care",
      missionTitle: "Community health sprint",
      skills: ["health", "logistics"],
      causes: ["health", "women"],
      modality: Modality.ONSITE,
      country: "Senegal",
      city: "Thiès",
      urgency: 8,
    },
    {
      email: "learning@skool.org",
      orgName: "Skool Builders",
      missionTitle: "After-school mentoring",
      skills: ["education", "communication"],
      causes: ["youth", "education"],
      modality: Modality.HYBRID,
      country: "France",
      city: "Lyon",
      urgency: 5,
    },
  ];

  for (const assoc of associations) {
    await prisma.user.upsert({
      where: { email: assoc.email },
      update: {},
      create: {
        email: assoc.email,
        role: Role.ASSOCIATION,
        association: {
          create: {
            orgName: assoc.orgName,
            approved: true,
            opportunities: {
              create: {
                title: assoc.missionTitle,
                description: "Help us scale operations with vetted volunteers.",
                requiredSkills: assoc.skills,
                causes: assoc.causes,
                modality: assoc.modality,
                country: assoc.country,
                city: assoc.city,
                urgency: assoc.urgency,
              },
            },
          },
        },
      },
    });
  }
}

async function main() {
  await seedAdmin();
  await seedVolunteers();
  await seedAssociations();
}

main()
  .then(() => {
    console.log("Seed completed");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
