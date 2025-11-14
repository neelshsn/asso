"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useRouter } from "@/lib/navigation";
import { useState } from "react";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

type FormValues = z.infer<typeof schema>;

export function AdminLoginForm({
  locale,
  title,
  subtitle,
}: {
  locale: string;
  title: string;
  subtitle: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setPending(true);
    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
      callbackUrl: `/${locale}/admin`,
    });
    setPending(false);
    if (result?.error) {
      toast.error("Invalid credentials");
      return;
    }
    toast.success("Welcome back");
    router.push(`/${locale}/admin`);
  };

  const handleAutoLogin = async () => {
    setPending(true);
    const response = await fetch("/api/admin/demo-login", {
      method: "POST",
    });
    setPending(false);
    if (!response.ok) {
      toast.error("Auto-login failed");
      return;
    }
    toast.success("Logged in as admin");
    router.push(`/${locale}/admin`);
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-white/60 bg-white/95 p-10 shadow-card">
      <h1 className="font-display text-3xl text-ink">{title}</h1>
      <p className="text-ink/70 mt-2">{subtitle}</p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Input
          type="email"
          placeholder="Email"
          {...form.register("email")}
          aria-label="Email"
        />
        <Input
          type="password"
          placeholder="Password"
          {...form.register("password")}
          aria-label="Password"
        />
        <Button
          type="submit"
          disabled={pending}
          className="bg-teal hover:bg-pink w-full rounded-full"
        >
          {pending ? "." : "Login"}
        </Button>
      </form>
      <Button
        type="button"
        variant="secondary"
        disabled={pending}
        className="border-orange/40 bg-orange/5 hover:bg-orange/10 mt-4 w-full rounded-full border border-dashed text-orange"
        onClick={handleAutoLogin}
      >
        Quick demo login
      </Button>
    </div>
  );
}
