import { prisma } from "@/lib/db";
import { MatchStatus, Modality, Prisma } from "@prisma/client";
import { subDays } from "date-fns";
import { sendMatchProposalEmail, sendAcceptedEmail } from "@/lib/mailer";
import { hasSynonymMatch } from "@/lib/skill-synonyms";

export type MatchSettings = {
  threshold: number;
  weights: {
    skills: number;
    causes: number;
    availability: number;
    language: number;
    modality: number;
  };
};

const DEFAULT_SETTINGS: MatchSettings = {
  threshold: 60,
  weights: {
    skills: 0.4,
    causes: 0.2,
    availability: 0.2,
    language: 0.1,
    modality: 0.1,
  },
};

const SETTINGS_KEY = "match-settings";

export async function getMatchSettings(): Promise<MatchSettings> {
  const record = await prisma.setting.findUnique({
    where: { key: SETTINGS_KEY },
  });
  if (!record) return DEFAULT_SETTINGS;
  return Object.assign({}, DEFAULT_SETTINGS, record.value ?? {});
}

export async function saveMatchSettings(settings: MatchSettings) {
  await prisma.setting.upsert({
    where: { key: SETTINGS_KEY },
    update: { value: settings },
    create: { key: SETTINGS_KEY, value: settings },
  });
}

function toStringArray(value: Prisma.JsonValue | null | undefined): string[] {
  if (!value || !Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item : "").trim())
    .filter(Boolean);
}

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function jaccardScore(vol: string[], opp: string[]) {
  if (!vol.length || !opp.length) return 50;
  const a = new Set(vol.map(normalize));
  const b = new Set(opp.map(normalize));
  const intersection = [...a].filter((value) => b.has(value)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : Math.round((intersection / union) * 100);
}

function availabilityScore(
  vol: { availableFrom?: Date | null; availableTo?: Date | null },
  opp: { startDate?: Date | null; endDate?: Date | null },
) {
  if (
    !vol.availableFrom ||
    !vol.availableTo ||
    !opp.startDate ||
    !opp.endDate
  ) {
    return 80;
  }
  const start =
    vol.availableFrom > opp.startDate ? vol.availableFrom : opp.startDate;
  const end = vol.availableTo < opp.endDate ? vol.availableTo : opp.endDate;
  if (end < start) return 0;
  const overlap = end.getTime() - start.getTime();
  const total = opp.endDate.getTime() - opp.startDate.getTime();
  return Math.min(100, Math.round((overlap / (total || 1)) * 100));
}

function languageScore(vol: string[], assoc: string[]) {
  if (!vol.length && !assoc.length) return 50;
  if (!vol.length || !assoc.length) return 60;
  const overlap = vol.some((lang) => assoc.includes(lang));
  return overlap ? 100 : 50;
}

function modalityScore(
  modality: Modality,
  oppModality: Modality,
  remoteOk: boolean,
  relaxed: boolean,
) {
  if (modality === oppModality) return 100;
  if (remoteOk && oppModality === Modality.REMOTE) return 100;
  return relaxed ? 70 : 50;
}

function synonymBonus(volSkills: string[], oppSkills: string[]) {
  let bonus = 0;
  volSkills.forEach((vol) => {
    oppSkills.forEach((opp) => {
      if (hasSynonymMatch(vol, opp)) {
        bonus += 5;
      }
    });
  });
  return Math.min(10, bonus);
}

interface RunOptions {
  relaxed?: boolean;
  volunteerIds?: string[];
}

export async function runMatching({
  relaxed = false,
  volunteerIds,
}: RunOptions = {}) {
  const settings = await getMatchSettings();
  const threshold = Math.round(settings.threshold * (relaxed ? 0.85 : 1));

  const volunteers = await prisma.volunteerProfile.findMany({
    where: {
      approved: true,
      ...(volunteerIds ? { id: { in: volunteerIds } } : {}),
    },
    include: {
      user: true,
    },
  });

  const opportunities = await prisma.opportunity.findMany({
    where: { active: true, association: { approved: true } },
    include: {
      association: {
        include: { user: true },
      },
    },
  });

  const newMatchIds: string[] = [];

  for (const volunteer of volunteers) {
    const volunteerSkills = toStringArray(volunteer.skills);
    const volunteerCauses = toStringArray(volunteer.causes);
    const volunteerLanguages = toStringArray(volunteer.user.languages).map(
      normalize,
    );

    const scored = opportunities
      .map((opportunity) => {
        const oppSkills = toStringArray(opportunity.requiredSkills);
        const oppCauses = toStringArray(opportunity.causes);
        const assocLanguages = toStringArray(
          opportunity.association.user.languages,
        ).map(normalize);

        const scoreSkills = jaccardScore(volunteerSkills, oppSkills);
        const scoreCauses = jaccardScore(volunteerCauses, oppCauses);
        const scoreAvailability = availabilityScore(volunteer, opportunity);
        const scoreLanguage = languageScore(volunteerLanguages, assocLanguages);
        const scoreModality = modalityScore(
          volunteer.modality,
          opportunity.modality,
          volunteer.remoteOk,
          relaxed,
        );

        const weighted =
          settings.weights.skills * scoreSkills +
          settings.weights.causes * scoreCauses +
          settings.weights.availability * scoreAvailability +
          settings.weights.language * scoreLanguage +
          settings.weights.modality * scoreModality;

        const score = Math.min(
          100,
          Math.round(weighted + synonymBonus(volunteerSkills, oppSkills)),
        );

        return { score, opportunity };
      })
      .filter(({ score }) => score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    for (const matchCandidate of scored) {
      const existing = await prisma.match.findFirst({
        where: {
          volunteerId: volunteer.id,
          opportunityId: matchCandidate.opportunity.id,
        },
      });
      if (existing) continue;

      const match = await prisma.match.create({
        data: {
          volunteerId: volunteer.id,
          opportunityId: matchCandidate.opportunity.id,
          score: matchCandidate.score,
        },
      });
      await prisma.volunteerProfile.update({
        where: { id: volunteer.id },
        data: { lastProposalAt: new Date() },
      });
      newMatchIds.push(match.id);
    }
  }

  return { matchesCreated: newMatchIds.length, matchIds: newMatchIds };
}

export async function notifyMatches(matchIds?: string[]) {
  const matches = await prisma.match.findMany({
    where: {
      status: MatchStatus.PROPOSED,
      notifiedAt: null,
      ...(matchIds ? { id: { in: matchIds } } : {}),
    },
    include: {
      volunteer: { include: { user: true } },
      opportunity: { include: { association: { include: { user: true } } } },
    },
  });

  for (const match of matches) {
    await sendMatchProposalEmail({
      volunteerEmail: match.volunteer.user.email,
      associationEmail: match.opportunity.association.user.email,
      matchId: match.id,
      volunteerToken: match.volunteerToken,
      associationToken: match.associationToken,
    });

    await prisma.match.update({
      where: { id: match.id },
      data: { notifiedAt: new Date() },
    });
  }

  return { sent: matches.length };
}

export async function confirmMatch(
  token: string,
  action: "accept" | "decline",
) {
  const match = await prisma.match.findFirst({
    where: {
      OR: [{ volunteerToken: token }, { associationToken: token }],
    },
    include: {
      volunteer: { include: { user: true } },
      opportunity: { include: { association: { include: { user: true } } } },
    },
  });

  if (!match) return { ok: false, message: "Match not found" };

  if (action === "decline") {
    await prisma.match.update({
      where: { id: match.id },
      data: { status: MatchStatus.DECLINED },
    });
    return { ok: true, status: MatchStatus.DECLINED };
  }

  const isVolunteer = match.volunteerToken === token;
  const data = isVolunteer
    ? { volunteerAccepted: true }
    : { associationAccepted: true };
  let status = match.status;

  const updated = await prisma.match.update({
    where: { id: match.id },
    data,
  });

  if (updated.volunteerAccepted && updated.associationAccepted) {
    await prisma.match.update({
      where: { id: match.id },
      data: { status: MatchStatus.ACCEPTED },
    });
    await sendAcceptedEmail({
      volunteerEmail: match.volunteer.user.email,
      associationEmail: match.opportunity.association.user.email,
    });
    status = MatchStatus.ACCEPTED;
  }

  return { ok: true, status };
}

export async function widenScopeAndMatch() {
  const limit = subDays(new Date(), 30);
  const volunteers = await prisma.volunteerProfile.findMany({
    where: {
      approved: true,
      OR: [{ lastProposalAt: null }, { lastProposalAt: { lt: limit } }],
    },
    select: { id: true },
  });
  if (!volunteers.length) return { matchesCreated: 0 };
  return runMatching({
    relaxed: true,
    volunteerIds: volunteers.map((v) => v.id),
  });
}
