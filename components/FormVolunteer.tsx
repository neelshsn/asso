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
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  languages: z.string().min(2),
  country: z.string().min(2),
  city: z.string().min(2),
  skills: z.string().min(2),
  causes: z.string().min(2),
  availability: z.enum(["FULLTIME", "PARTTIME", "OCCASIONAL"]),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  modality: z.enum(["ONSITE", "REMOTE", "HYBRID"]),
  preferredCountries: z.string().optional().default(""),
  remoteOk: z.boolean().default(false),
  consent: z.boolean().refine((val) => val, { message: "Required" }),
});

type FormValues = z.input<typeof formSchema>;
type FieldName = keyof FormValues;

const availabilityOptions = [
  { value: "FULLTIME", label: "Full time" },
  { value: "PARTTIME", label: "Part time" },
  { value: "OCCASIONAL", label: "Occasional" },
];

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

const volunteerImages = [
  "/images/form-01.jpg",
  "/images/form-02.jpg",
  "/images/form-03.jpg",
];

export function FormVolunteer({ googleFormUrl }: { googleFormUrl?: string }) {
  const t = useTranslations("forms");
  const notify = useTranslations("notifications");
  const router = useRouter();
  const [useGoogleForm, setUseGoogleForm] = useState(false);
  const [pending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      key: "identity",
      title: t("volunteerSteps.identity.title"),
      description: t("volunteerSteps.identity.description"),
      fields: [
        "firstName",
        "lastName",
        "email",
        "languages",
        "country",
        "city",
      ] as FieldName[],
    },
    {
      key: "story",
      title: t("volunteerSteps.story.title"),
      description: t("volunteerSteps.story.description"),
      fields: ["skills", "causes", "preferredCountries"] as FieldName[],
    },
    {
      key: "availability",
      title: t("volunteerSteps.availability.title"),
      description: t("volunteerSteps.availability.description"),
      fields: [
        "availability",
        "availableFrom",
        "availableTo",
        "modality",
        "remoteOk",
        "consent",
      ] as FieldName[],
    },
  ];

  const totalSteps = steps.length;
  const step = steps[currentStep];
  const currentImage =
    volunteerImages[currentStep] ?? volunteerImages[volunteerImages.length - 1];
  const fieldSet = new Set(step.fields);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      availability: "FULLTIME",
      modality: "ONSITE",
      remoteOk: false,
      consent: false,
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const payload = {
          ...values,
          languages: splitValues(values.languages),
          skills: splitValues(values.skills),
          causes: splitValues(values.causes),
          preferredCountries: splitValues(values.preferredCountries),
        };
        const response = await fetch("/api/volunteer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Request failed");
        toast.success(t("volunteer.success"));
        router.push("/success");
        form.reset({
          availability: "FULLTIME",
          modality: "ONSITE",
          remoteOk: false,
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
              {t("volunteer.title")}
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
            <p className="text-xs uppercase tracking-[0.35em] text-turquoise">
              {t("volunteer.title")}
            </p>
            <h1 className="font-display text-3xl text-ink">
              {t("volunteer.description")}
            </h1>
            <p className="text-ink/60 text-sm">{t("recommendation")}</p>
          </div>

          {googleFormUrl ? (
            <div className="border-orange/30 bg-salmon/20 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed p-4">
              <Switch
                checked={useGoogleForm}
                onCheckedChange={setUseGoogleForm}
                id="toggle-google-form-vol"
              />
              <label
                htmlFor="toggle-google-form-vol"
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
                {fieldSet.has("firstName") && (
                  <Input
                    {...form.register("firstName")}
                    placeholder={t("volunteer.labels.firstName")}
                  />
                )}
                {fieldSet.has("lastName") && (
                  <Input
                    {...form.register("lastName")}
                    placeholder={t("volunteer.labels.lastName")}
                  />
                )}
                {fieldSet.has("email") && (
                  <Input
                    type="email"
                    {...form.register("email")}
                    placeholder={t("volunteer.labels.email")}
                  />
                )}
                {fieldSet.has("languages") && (
                  <Textarea
                    {...form.register("languages")}
                    placeholder={t("volunteer.labels.languages")}
                  />
                )}
                {fieldSet.has("country") && (
                  <Input
                    {...form.register("country")}
                    placeholder={t("volunteer.labels.country")}
                  />
                )}
                {fieldSet.has("city") && (
                  <Input
                    {...form.register("city")}
                    placeholder={t("volunteer.labels.city")}
                  />
                )}
                {fieldSet.has("skills") && (
                  <Textarea
                    {...form.register("skills")}
                    placeholder={t("volunteer.labels.skills")}
                  />
                )}
                {fieldSet.has("causes") && (
                  <Input
                    {...form.register("causes")}
                    placeholder={t("volunteer.labels.causes")}
                  />
                )}
                {fieldSet.has("preferredCountries") && (
                  <Textarea
                    {...form.register("preferredCountries")}
                    placeholder={t("volunteer.labels.preferredCountries")}
                  />
                )}
                {fieldSet.has("availability") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-ink">
                      {t("volunteer.labels.availability")}
                    </label>
                    <Select
                      value={form.watch("availability")}
                      onValueChange={(val) =>
                        form.setValue(
                          "availability",
                          val as FormValues["availability"],
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availabilityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {fieldSet.has("modality") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-ink">
                      {t("volunteer.labels.modality")}
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
                {fieldSet.has("availableFrom") && (
                  <Input type="date" {...form.register("availableFrom")} />
                )}
                {fieldSet.has("availableTo") && (
                  <Input type="date" {...form.register("availableTo")} />
                )}
                {fieldSet.has("remoteOk") && (
                  <label className="flex items-center gap-2 text-sm text-ink">
                    <Checkbox
                      checked={form.watch("remoteOk")}
                      onCheckedChange={(val) =>
                        form.setValue("remoteOk", Boolean(val))
                      }
                    />
                    {t("volunteer.labels.remoteOk")}
                  </label>
                )}
                {fieldSet.has("consent") && (
                  <label className="flex items-center gap-2 text-sm text-ink">
                    <Checkbox
                      checked={form.watch("consent")}
                      onCheckedChange={(val) =>
                        form.setValue("consent", Boolean(val))
                      }
                    />
                    {t("volunteer.labels.consent")}
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
                    {pending ? "..." : t("volunteer.labels.submit")}
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
