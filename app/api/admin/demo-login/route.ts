import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encode } from "next-auth/jwt";

type AdminSummary = {
  id: string;
  email: string;
  firstName: string | null;
  role: Role;
};

export async function POST() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Missing NEXTAUTH_SECRET" },
      { status: 500 },
    );
  }

  let admin: AdminSummary | null = null;

  if (process.env.DATABASE_URL) {
    try {
      admin = await prisma.user.findFirst({
        where: { role: Role.ADMIN },
        select: { id: true, email: true, firstName: true, role: true },
      });
    } catch (error) {
      console.warn("Demo login falling back to env admin:", error);
    }
  }

  const fallbackEmail = process.env.ADMIN_EMAIL ?? "admin@ngo.local";

  const token = await encode({
    token: {
      name: admin?.firstName ?? "Admin",
      email: admin?.email ?? fallbackEmail,
      role: admin?.role ?? Role.ADMIN,
      sub: admin?.id ?? "demo-admin",
    },
    secret,
    maxAge: 30 * 24 * 60 * 60,
  });

  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

  const cookieStore = await cookies();

  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
