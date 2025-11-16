export type FlagOption = {
  value: string;
  flagCode: string;
  labelKey: string;
};

export const volunteerLanguageOptions: FlagOption[] = [
  { value: "fr", flagCode: "fr", labelKey: "fr" },
  { value: "en", flagCode: "gb", labelKey: "en" },
  { value: "es", flagCode: "es", labelKey: "es" },
  { value: "ar", flagCode: "ma", labelKey: "ar" },
  { value: "pt", flagCode: "pt", labelKey: "pt" },
  { value: "sw", flagCode: "tz", labelKey: "sw" },
  { value: "de", flagCode: "de", labelKey: "de" },
  { value: "it", flagCode: "it", labelKey: "it" },
];

export const volunteerCountryOptions: FlagOption[] = [
  { value: "France", flagCode: "fr", labelKey: "france" },
  { value: "Maroc", flagCode: "ma", labelKey: "morocco" },
  { value: "Senegal", flagCode: "sn", labelKey: "senegal" },
  { value: "Cote d'Ivoire", flagCode: "ci", labelKey: "ivoryCoast" },
  { value: "Tunisie", flagCode: "tn", labelKey: "tunisia" },
  { value: "Madagascar", flagCode: "mg", labelKey: "madagascar" },
  { value: "Cameroun", flagCode: "cm", labelKey: "cameroon" },
  { value: "Kenya", flagCode: "ke", labelKey: "kenya" },
  { value: "Rwanda", flagCode: "rw", labelKey: "rwanda" },
  { value: "Cambodge", flagCode: "kh", labelKey: "cambodia" },
];

export type SkillOption = {
  value: string;
  labelKey: string;
  isOther?: boolean;
};

export const volunteerSkillOptions: SkillOption[] = [
  { value: "education", labelKey: "education" },
  { value: "sante", labelKey: "health" },
  { value: "logistique", labelKey: "logistics" },
  { value: "communication", labelKey: "communication" },
  { value: "fundraising", labelKey: "fundraising" },
  { value: "gestion", labelKey: "management" },
  { value: "tech", labelKey: "tech" },
  { value: "other", labelKey: "other", isOther: true },
];
