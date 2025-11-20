"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/navigation";
import { toast } from "sonner";
import { LockKeyhole } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  remember: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;

const fieldClasses =
  "h-12 rounded-2xl border border-ink/15 bg-white/90 px-4 text-base placeholder:text-ink/40 shadow-sm transition focus:border-orange focus-visible:ring-0";

export function LoginForm() {
  const t = useTranslations("forms");
  const notify = useTranslations("notifications");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  const onSubmit = (values: LoginValues) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const result = (await response.json().catch(() => null)) as
          | { redirect: string; role: string }
          | { error?: string }
          | null;
        const hasError =
          result !== null &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error !== "undefined";
        if (!response.ok || !result || hasError) {
          const message =
            hasError && result && "error" in result && result.error
              ? result.error
              : "Request failed";
          throw new Error(message);
        }
        const data = result as {
          redirect: string;
          role: string;
        };
        toast.success(t("login.success"));
        router.push(data.redirect);
        form.reset({
          email: values.email,
          password: "",
          remember: values.remember,
        });
      } catch (error) {
        console.error(error);
        toast.error(notify("error"));
      }
    });
  };

  return (
    <section className="via-beige/80 relative isolate flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-gradient-to-b from-cream to-white px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(237,71,143,0.35), transparent 55%), radial-gradient(circle at 80% 0%, rgba(137,172,70,0.35), transparent 45%)",
        }}
      />
      <div className="relative z-10 w-full max-w-md rounded-[36px] border border-white/60 bg-white/90 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.18)] backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="bg-orange/15 flex h-12 w-12 items-center justify-center rounded-2xl text-orange">
            <LockKeyhole className="h-6 w-6" />
          </span>
          <div>
            <p className="text-ink/60 text-xs uppercase tracking-[0.35em]">
              {t("login.title")}
            </p>
            <h1 className="font-display text-2xl text-ink">
              {t("login.description")}
            </h1>
          </div>
        </div>
        <p className="text-ink/70 mt-4 text-sm">{t("login.subtitle")}</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="login-email"
              className="text-sm font-medium text-ink"
            >
              {t("login.labels.email")}
            </label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              className={fieldClasses}
              {...form.register("email")}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="login-password"
              className="text-sm font-medium text-ink"
            >
              {t("login.labels.password")}
            </label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              className={fieldClasses}
              {...form.register("password")}
            />
          </div>
          <div className="text-ink/70 flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={form.watch("remember")}
                onCheckedChange={(val) =>
                  form.setValue("remember", Boolean(val))
                }
              />
              {t("login.labels.remember")}
            </label>
            <a
              href="mailto:hello@ngo-match.org?subject=Acc%C3%A8s%20N%27GO%20Match"
              className="text-orange underline"
            >
              {t("login.labels.forgot")}
            </a>
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="h-12 w-full rounded-full bg-orange text-base text-white shadow-lg hover:bg-turquoise"
          >
            {pending ? "..." : t("login.labels.submit")}
          </Button>
          <p className="text-ink/60 text-center text-xs">{t("login.notice")}</p>
        </form>
      </div>
    </section>
  );
}
