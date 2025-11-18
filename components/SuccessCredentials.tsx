"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  clearStoredCredentials,
  readStoredCredentials,
  type StoredCredentials,
} from "@/lib/credential-storage";

export function SuccessCredentials() {
  const t = useTranslations("success.credentials");
  const [credentials, setCredentials] = useState<StoredCredentials | null>(
    null,
  );

  useEffect(() => {
    const stored = readStoredCredentials();
    if (stored) {
      setCredentials(stored);
      clearStoredCredentials();
    }
  }, []);

  if (!credentials) return null;

  const descriptionKey =
    credentials.type === "association"
      ? "description.association"
      : "description.volunteer";

  return (
    <div className="border-ink/10 rounded-[28px] border bg-white/90 p-6 text-left shadow-md">
      <p className="text-xs uppercase tracking-[0.35em] text-turquoise">
        {t("title")}
      </p>
      <p className="mt-2 text-base text-ink">{t(descriptionKey)}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="border-ink/10 bg-cream/60 rounded-2xl border p-4">
          <p className="text-ink/60 text-xs font-medium uppercase tracking-[0.25em]">
            {t("loginLabel")}
          </p>
          <p className="mt-2 break-words text-lg font-semibold text-ink">
            {credentials.login}
          </p>
        </div>
        {credentials.password ? (
          <div className="border-ink/10 bg-cream/60 rounded-2xl border p-4">
            <p className="text-ink/60 text-xs font-medium uppercase tracking-[0.25em]">
              {t("passwordLabel")}
            </p>
            <p className="mt-2 break-words text-lg font-semibold text-ink">
              {credentials.password}
            </p>
          </div>
        ) : null}
      </div>
      <p className="text-ink/60 mt-4 text-sm">{t("hint")}</p>
    </div>
  );
}
