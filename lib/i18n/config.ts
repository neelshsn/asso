export const locales = ["fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";
export const localePrefix = "always";

export const localeLabels: Record<Locale, string> = {
  fr: "Français",
};
