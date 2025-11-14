import type { Role } from "@/lib/enums";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      email?: string | null;
      name?: string | null;
      role?: Role;
    };
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
  }
}
