"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  orgName: z.string().min(2),
  email: z.string().email(),
  website: z.string().optional(),
  social: z.string().optional(),
  legalStatus: z.string().optional(),
  missionTitle: z.string().min(2),
  description: z.string().min(10),
  requiredSkills: z.string().min(2),
  causes: z.string().min(2),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  modality: z.enum(["ONSITE", "REMOTE", "HYBRID"]),
  country: z.string().min(2),
  city: z.string().min(2),
  urgency: z.number().min(0).max(10),
  consent: z.boolean().refine((val) => val, { message: "Required" }),
});

type FormValues = z.infer<typeof formSchema>;
type FieldName = keyof FormValues;

const modalities = [
  { value: "ONSITE", label: "On-site" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
];

function splitValues(value?: string) {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

const associationImages = [
  "/images/form-04.jpg",
  "/images/form-05.jpg",
  "/images/form-06.jpg",
];

export function FormAssociation({ googleFormUrl }: { googleFormUrl?: string }) {
  const t = useTranslations("forms");
  const notify = useTranslations("notifications");
  const router = useRouter();
  const [useGoogleForm, setUseGoogleForm] = useState(false);
  const [pending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      key: "identity",
      title: t("associationSteps.identity.title"),
      description: t("associationSteps.identity.description"),
      fields: [
        "orgName",
        "email",
        "website",
        "social",
        "legalStatus",
      ] as FieldName[],
    },
    {
      key: "mission",
      title: t("associationSteps.mission.title"),
      description: t("associationSteps.mission.description"),
      fields: [
        "missionTitle",
        "description",
        "requiredSkills",
        "causes",
      ] as FieldName[],
    },
    {
      key: "logistics",
      title: t("associationSteps.logistics.title"),
      description: t("associationSteps.logistics.description"),
      fields: [
        "startDate",
        "endDate",
        "modality",
        "country",
        "city",
        "urgency",
        "consent",
      ] as FieldName[],
    },
  ];

  const totalSteps = steps.length;
  const step = steps[currentStep];
  const currentImage =
    associationImages[currentStep] ??
    associationImages[associationImages.length - 1];
  const fieldSet = new Set(step.fields);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modality: "ONSITE",
      urgency: 5,
      consent: false,
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const payload = {
          ...values,
          requiredSkills: splitValues(values.requiredSkills),
          causes: splitValues(values.causes),
        };

        const response = await fetch("/api/association", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Request failed");
        toast.success(t("association.success"));
        router.push("/success");
        form.reset({
          modality: "ONSITE",
          urgency: 5,
          consent: false,
        });
        setCurrentStep(0);
      } catch (error) {
        console.error(error);
        toast.error(notify("error"));
      }
    });
  };

  const handleNext = async () => {
    const valid = await form.trigger(step.fields);
    if (valid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const isLast = currentStep === totalSteps - 1;

  return (
    <section className="flex min-h-[100dvh] w-full flex-col overflow-hidden bg-beige md:flex-row">
      <div className="relative h-[45vh] w-full overflow-hidden md:h-auto md:w-1/2">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${currentImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-between p-8 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">
              {t("association.title")}
            </p>
            <h2 className="mt-6 font-display text-4xl leading-tight">
              {step.title}
            </h2>
            <p className="mt-3 max-w-sm text-white/85">{step.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl">
              {String(currentStep + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-1 gap-2">
              {steps.map((s, index) => (
                <span
                  key={s.key}
                  className={cn(
                    "h-1 flex-1 rounded-full transition",
                    index <= currentStep ? "bg-white" : "bg-white/30",
                  )}
                />
              ))}
            </div>
            <span className="text-white/70">
              /{String(totalSteps).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center bg-white px-6 py-12 md:px-16">
        <div className="w-full max-w-xl space-y-8">
          <div className="space-y-3">
            <p className="text-orange/70 text-xs uppercase tracking-[0.35em]">
              {t("association.title")}
            </p>
            <h1 className="font-display text-3xl text-ink">
              {t("association.description")}
            </h1>
            <p className="text-ink/60 text-sm">{t("recommendation")}</p>
          </div>

          {googleFormUrl ? (
            <div className="border-orange/30 bg-salmon/20 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed p-4">
              <Switch
                checked={useGoogleForm}
                onCheckedChange={setUseGoogleForm}
                id="toggle-google-form-assoc"
              />
              <label
                htmlFor="toggle-google-form-assoc"
                className="text-sm text-ink"
              >
                {t("googleToggle")}
              </label>
              <p className="text-ink/60 text-xs">{t("recommendation")}</p>
            </div>
          ) : null}

          {useGoogleForm && googleFormUrl ? (
            <iframe
              src={googleFormUrl}
              className="border-orange/20 h-[520px] w-full rounded-2xl border"
              title="Google Form"
            />
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div>
                <div className="flex items-center gap-3">
                  {steps.map((s, index) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setCurrentStep(index)}
                      className={cn(
                        "h-2 flex-1 rounded-full transition",
                        index <= currentStep ? "bg-orange" : "bg-orange/20",
                      )}
                      aria-label={s.title}
                    />
                  ))}
                  <span className="text-ink/60 text-xs">
                    {currentStep + 1}/{totalSteps}
                  </span>
                </div>
                <div className="text-ink/70 mt-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-turquoise">
                    {step.title}
                  </p>
                  <p className="text-sm">{step.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                {fieldSet.has("orgName") && (
                  <Input
                    {...form.register("orgName")}
                    placeholder={t("association.labels.orgName")}
                  />
                )}
                {fieldSet.has("email") && (
                  <Input
                    type="email"
                    {...form.register("email")}
                    placeholder={t("association.labels.email")}
                  />
                )}
                {fieldSet.has("website") && (
                  <Input
                    {...form.register("website")}
                    placeholder={t("association.labels.website")}
                  />
                )}
                {fieldSet.has("social") && (
                  <Input
                    {...form.register("social")}
                    placeholder={t("association.labels.social")}
                  />
                )}
                {fieldSet.has("legalStatus") && (
                  <Input
                    {...form.register("legalStatus")}
                    placeholder={t("association.labels.legalStatus")}
                  />
                )}
                {fieldSet.has("missionTitle") && (
                  <Input
                    {...form.register("missionTitle")}
                    placeholder={t("association.labels.missionTitle")}
                  />
                )}
                {fieldSet.has("description") && (
                  <Textarea
                    {...form.register("description")}
                    placeholder={t("association.labels.description")}
                  />
                )}
                {fieldSet.has("requiredSkills") && (
                  <Textarea
                    {...form.register("requiredSkills")}
                    placeholder={t("association.labels.requiredSkills")}
                  />
                )}
                {fieldSet.has("causes") && (
                  <Textarea
                    {...form.register("causes")}
                    placeholder={t("association.labels.causes")}
                  />
                )}
                {fieldSet.has("startDate") && (
                  <Input type="date" {...form.register("startDate")} />
                )}
                {fieldSet.has("endDate") && (
                  <Input type="date" {...form.register("endDate")} />
                )}
                {fieldSet.has("modality") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-ink">
                      {t("association.labels.modality")}
                    </label>
                    <Select
                      value={form.watch("modality")}
                      onValueChange={(val) =>
                        form.setValue("modality", val as FormValues["modality"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {modalities.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {fieldSet.has("country") && (
                  <Input
                    {...form.register("country")}
                    placeholder={t("association.labels.country")}
                  />
                )}
                {fieldSet.has("city") && (
                  <Input
                    {...form.register("city")}
                    placeholder={t("association.labels.city")}
                  />
                )}
                {fieldSet.has("urgency") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-ink">
                      {t("association.labels.urgency")} ({form.watch("urgency")}
                      )
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={form.watch("urgency")}
                      onChange={(event) =>
                        form.setValue("urgency", Number(event.target.value))
                      }
                      className="w-full accent-orange"
                    />
                  </div>
                )}
                {fieldSet.has("consent") && (
                  <label className="flex items-center gap-2 text-sm text-ink">
                    <Checkbox
                      checked={form.watch("consent")}
                      onCheckedChange={(val) =>
                        form.setValue("consent", Boolean(val))
                      }
                    />
                    {t("association.labels.consent")}
                  </label>
                )}
              </div>

              <div className="flex flex-wrap justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="border-orange/40 rounded-full text-ink hover:text-orange"
                >
                  Back
                </Button>
                {isLast ? (
                  <Button
                    type="submit"
                    disabled={pending}
                    className="rounded-full bg-orange px-8 text-white hover:bg-turquoise"
                  >
                    {pending ? "..." : t("association.labels.submit")}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="rounded-full bg-orange px-8 text-white hover:bg-turquoise"
                  >
                    Next
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
