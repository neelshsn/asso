import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getTranslations } from "next-intl/server";

type AdminLoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminLoginPage(props: AdminLoginPageProps) {
  const { locale } = await props.params;
  const t = await getTranslations("admin");

  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center justify-center py-16">
      <AdminLoginForm
        locale={locale}
        title={t("welcome")}
        subtitle={t("resend")}
      />
    </div>
  );
}
