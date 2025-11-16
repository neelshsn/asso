export const causeCatalog = [
  { id: "handicap", label: "Handicap" },
  { id: "retraites", label: "Personnes retraitees" },
  { id: "ecologie", label: "Ecologie" },
  { id: "sdf", label: "SDF & maraudes" },
  { id: "etudiants", label: "Etudiants" },
  { id: "recherche", label: "Recherche & sante" },
  { id: "animaux", label: "Animaux" },
  { id: "famine", label: "Famine" },
  { id: "isolement", label: "Personnes isolees" },
  { id: "orphelins", label: "Enfants & orphelins" },
  { id: "femmes", label: "Femmes" },
] as const;

export type CauseCatalogEntry = (typeof causeCatalog)[number];
export type CauseId = CauseCatalogEntry["id"];

export const causeCatalogMap: Record<CauseId, CauseCatalogEntry> =
  Object.fromEntries(causeCatalog.map((cause) => [cause.id, cause])) as Record<
    CauseId,
    CauseCatalogEntry
  >;

export const causeOptions = causeCatalog.map((cause) => ({
  value: cause.id,
  label: cause.label,
}));
