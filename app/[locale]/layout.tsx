import "@/lib/cron";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileDock } from "@/components/MobileDock";
import { locales, type Locale } from "@/lib/i18n/config";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { pally, satoshi } from "@/lib/fonts";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout(props: LocaleLayoutProps) {
  const { children } = props;
  const { locale } = await props.params;
  const safeLocale = locale as Locale;

  if (!locales.includes(safeLocale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={safeLocale}
      suppressHydrationWarning
      className={`${satoshi.variable} ${pally.variable}`}
    >
      <body className="text-ink antialiased">
        <div className="global-gradient" aria-hidden />
        <NextIntlClientProvider locale={safeLocale} messages={messages}>
          <div className="site-shell flex min-h-screen flex-col gap-6">
            <main className="page-surface flex-1 pb-28 md:pb-0">
              {children}
            </main>
            <SiteFooter />
          </div>
          <MobileDock />
          <Toaster richColors position="top-right" duration={4000} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
