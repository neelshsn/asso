import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales, type Locale } from "./lib/i18n/config";

export default getRequestConfig(async ({ locale }) => {
  const requestedLocale = locale ?? defaultLocale;

  const localeToUse = (locales as readonly string[]).includes(requestedLocale)
    ? (requestedLocale as Locale)
    : defaultLocale;

  return {
    locale: localeToUse,
    messages: (await import(`./locales/${localeToUse}/common.json`)).default,
  };
});
