import { confirmMatch } from "@/lib/match";
import { defaultLocale } from "@/lib/i18n/config";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");
  const action = (searchParams.get("action") ?? "accept") as
    | "accept"
    | "decline";
  const locale = searchParams.get("locale") ?? defaultLocale;

  if (!token) {
    return NextResponse.redirect(
      `${origin}/${locale}/success?status=missing-token`,
    );
  }

  const result = await confirmMatch(token, action);
  const status = result.status ?? "pending";

  return NextResponse.redirect(`${origin}/${locale}/success?status=${status}`);
}
