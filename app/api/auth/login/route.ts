import { prisma } from "@/lib/db";
import { Role } from "@/lib/enums";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const redirectMap: Record<Role, string> = {
  [Role.VOLUNTEER]: "/volunteer/dashboard",
  [Role.ASSOCIATION]: "/association/dashboard",
  [Role.ADMIN]: "/admin/dashboard",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      select: { id: true, role: true, passwordHash: true },
    });

    if (!user?.passwordHash) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const match = await bcrypt.compare(payload.password, user.passwordHash);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      ok: true,
      role: user.role,
      redirect: redirectMap[user.role],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to authenticate" },
      { status: 400 },
    );
  }
}
