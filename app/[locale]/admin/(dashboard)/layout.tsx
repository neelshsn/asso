import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdminSession } from "@/lib/auth";
import type { ReactNode } from "react";

export default async function AdminShell({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminSession();
  return (
    <div className="mx-auto max-w-6xl py-10">
      <AdminNav />
      {children}
    </div>
  );
}
