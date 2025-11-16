"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
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
import Image from "next/image";
import { causeOptions } from "@/lib/cause-catalog";
import {
  volunteerCountryOptions,
  volunteerLanguageOptions,
  volunteerSkillOptions,
} from "@/lib/volunteer-options";
import type { LucideIcon } from "lucide-react";
import {
  Building,
  CalendarClock,
  CalendarDays,
  Clock3,
  Globe,
  HeartHandshake,
  Languages as LanguagesIcon,
  ListChecks,
  Mail,
  MapPin,
  MapPinned,
  ShieldCheck,
  Sparkles,
  UserRound,
  UserRoundCheck,
  Wifi,
} from "lucide-react";

const formSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    languages: z.array(z.string()).min(1),
    country: z.string().min(2),
    city: z.string().min(2),
    skills: z.array(z.string()).min(1),
    skillOther: z.string().optional(),
    causes: z.array(z.string()).min(1),
    availability: z.enum(["FULLTIME", "PARTTIME", "OCCASIONAL"]),
    availableFrom: z.string().optional(),
    availableTo: z.string().optional(),
    modality: z.enum(["ONSITE", "REMOTE", "HYBRID"]),
    preferredCountries: z.array(z.string()).default([]),
    remoteOk: z.boolean().default(false),
    consent: z.boolean().refine((val) => val, { message: "Required" }),
  })
  .superRefine((values, ctx) => {
    if (values.skills.includes("other")) {
      if (!values.skillOther || !values.skillOther.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Precisez cette competence",
          path: ["skillOther"],
        });
      }
    }
  });

type FormValues = z.input<typeof formSchema>;
type FieldName = keyof FormValues;
type MultiValueField = "languages" | "skills" | "causes" | "preferredCountries";

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

const volunteerImages = [
  "/images/form-01.jpg",
  "/images/form-02.jpg",
  "/images/form-03.jpg",
];

const fieldIcons: Partial<Record<FieldName, LucideIcon>> = {
  firstName: UserRound,
  lastName: UserRoundCheck,
  email: Mail,
  languages: LanguagesIcon,
  country: Globe,
  city: Building,
  skills: Sparkles,
  causes: HeartHandshake,
  preferredCountries: MapPinned,
  availability: Clock3,
  availableFrom: CalendarDays,
  availableTo: CalendarClock,
  modality: MapPin,
  remoteOk: Wifi,
  consent: ShieldCheck,
};

function FieldIconMark({
  icon: Icon,
  variant = "input",
}: {
  icon?: LucideIcon;
  variant?: "input" | "textarea";
}) {
  if (!Icon) return null;
  return (
    <span
      className={cn(
        "text-ink/40 pointer-events-none absolute left-4",
        variant === "textarea" ? "top-4" : "top-1/2 -translate-y-1/2",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </span>
  );
}

function FieldWrapper({
  field,
  variant = "input",
  children,
}: {
  field: FieldName;
  variant?: "input" | "textarea";
  children: ReactNode;
}) {
  if (!fieldIcons[field]) {
    return <>{children}</>;
  }
  return (
    <div className="relative">
      <FieldIconMark icon={fieldIcons[field]} variant={variant} />
      {children}
    </div>
  );
}

function InlineFieldIcon({
  field,
  className,
}: {
  field: FieldName;
  className?: string;
}) {
  const Icon = fieldIcons[field];
  if (!Icon) return null;
  return <Icon className={className} aria-hidden />;
}

function SelectionGroup({
  field,
  title,
  description,
  children,
}: {
  field: FieldName;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="border-ink/10 bg-cream/60 rounded-3xl border px-4 py-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <InlineFieldIcon field={field} className="h-4 w-4 text-orange" />
        {title}
      </p>
      {description ? (
        <p className="text-ink/60 mt-1 text-xs">{description}</p>
      ) : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function SelectableCard({
  label,
  selected,
  onClick,
  icon,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border-ink/15 hover:border-orange/60 hover:bg-orange/5 flex items-center gap-3 rounded-2xl border bg-white/80 px-3 py-2 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange",
        selected && "bg-orange/10 border-orange text-orange",
      )}
      aria-pressed={selected}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span className="flex-1">{label}</span>
    </button>
  );
}

function FlagIconBox({ code, label }: { code: string; label: string }) {
  return (
    <span className="border-ink/10 inline-flex h-5 w-7 overflow-hidden rounded-md border shadow-sm">
      <Image
        src={`/flag-icons-main/flags/4x3/${code}.svg`}
        alt={label}
        width={28}
        height={20}
        className="h-full w-full object-cover"
      />
    </span>
  );
}

const fieldClasses =
  "h-12 rounded-2xl border border-ink/15 bg-cream/70 px-4 text-base placeholder:text-ink/40 transition focus:border-orange focus:bg-white focus-visible:ring-0";
const selectTriggerClasses =
  "h-12 rounded-2xl border border-ink/15 bg-cream/70 px-4 text-base focus:ring-0 focus:outline-none";
const formCardClasses =
  "space-y-8 rounded-[32px] border border-ink/5 bg-white/95 p-5 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur md:border-none md:bg-transparent md:p-0 md:shadow-none";

const defaultValues: Partial<FormValues> = {
  firstName: "",
  lastName: "",
  email: "",
  languages: [],
  country: "",
  city: "",
  skills: [],
  skillOther: "",
  causes: [],
  availability: "FULLTIME",
  availableFrom: "",
  availableTo: "",
  modality: "ONSITE",
  preferredCountries: [],
  remoteOk: false,
  consent: false,
};

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
      fields: [
        "skills",
        "skillOther",
        "causes",
        "preferredCountries",
      ] as FieldName[],
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
    defaultValues,
  });

  const selectedLanguages = form.watch("languages");
  const selectedSkills = form.watch("skills");
  const selectedCauses = form.watch("causes");
  const selectedPreferredCountries = form.watch("preferredCountries");
  const selectedCountry = form.watch("country");
  const emailValue = form.watch("email") ?? "";
  const [emailLocalPart = "", emailDomainPart = ""] = emailValue.split("@", 2);
  const showSkillOther =
    fieldSet.has("skillOther") && selectedSkills.includes("other");
  const translateOption = (
    group: "languageOptions" | "countryOptions" | "skillOptions",
    key: string,
  ) => t(`volunteer.${group}.${key}` as Parameters<typeof t>[0]);
  const getLanguageLabel = (key: string) =>
    translateOption("languageOptions", key);
  const getCountryLabel = (key: string) =>
    translateOption("countryOptions", key);
  const getSkillLabel = (key: string) => translateOption("skillOptions", key);

  const toggleMultiValue = (field: MultiValueField, option: string) => {
    const currentValues = new Set(form.getValues(field) as string[]);
    if (currentValues.has(option)) {
      currentValues.delete(option);
    } else {
      currentValues.add(option);
    }
    form.setValue(field, Array.from(currentValues));
  };

  const updateEmailPart = (part: "local" | "domain", value: string) => {
    const sanitized = value.replace(/\s+/g, "");
    const nextLocal = part === "local" ? sanitized : emailLocalPart;
    const nextDomain = part === "domain" ? sanitized : emailDomainPart;
    const emailString = nextDomain ? `${nextLocal}@${nextDomain}` : nextLocal;
    form.setValue("email", emailString);
  };

  useEffect(() => {
    if (!selectedSkills.includes("other") && form.getValues("skillOther")) {
      form.setValue("skillOther", "");
    }
  }, [form, selectedSkills]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const { skillOther, ...rest } = values;
        const normalizedSkills = values.skills.filter(
          (skill) => skill !== "other",
        );
        if (values.skills.includes("other") && skillOther?.trim()) {
          normalizedSkills.push(skillOther.trim());
        }
        const payload = {
          ...rest,
          skills: normalizedSkills,
          preferredCountries: values.preferredCountries,
        };
        const response = await fetch("/api/volunteer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Request failed");
        toast.success(t("volunteer.success"));
        router.push("/success");
        form.reset(defaultValues);
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
    <section className="from-cream via-beige/70 relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-gradient-to-b to-white md:flex-row">
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

      <div className="flex flex-1 items-start bg-white/95 px-4 pb-32 pt-10 sm:px-8 md:items-center md:bg-white md:px-16 md:pb-12 md:pt-12">
        <div className={`w-full max-w-xl ${formCardClasses}`}>
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
                className="flex items-center gap-2 text-sm text-ink"
              >
                <ListChecks className="h-4 w-4 text-orange" />
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
              <div className="border-ink/5 bg-cream/60 rounded-[28px] border p-4 shadow-inner">
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
                  <FieldWrapper field="firstName">
                    <Input
                      {...form.register("firstName")}
                      placeholder={t("volunteer.labels.firstName")}
                      className={cn(
                        fieldClasses,
                        fieldIcons.firstName && "pl-12",
                      )}
                    />
                  </FieldWrapper>
                )}
                {fieldSet.has("lastName") && (
                  <FieldWrapper field="lastName">
                    <Input
                      {...form.register("lastName")}
                      placeholder={t("volunteer.labels.lastName")}
                      className={cn(
                        fieldClasses,
                        fieldIcons.lastName && "pl-12",
                      )}
                    />
                  </FieldWrapper>
                )}
                {fieldSet.has("email") && (
                  <FieldWrapper field="email">
                    <div
                      className={cn(
                        "border-ink/15 bg-cream/70 flex items-center gap-2 rounded-2xl border px-4 py-2 transition focus-within:border-orange focus-within:bg-white",
                        fieldIcons.email && "pl-12",
                      )}
                    >
                      <input
                        type="text"
                        value={emailLocalPart}
                        onChange={(event) =>
                          updateEmailPart("local", event.target.value)
                        }
                        placeholder={t("volunteer.labels.emailLocal")}
                        className="placeholder:text-ink/40 flex-1 bg-transparent text-base text-ink focus:outline-none"
                      />
                      <span className="text-ink/40">@</span>
                      <input
                        type="text"
                        value={emailDomainPart}
                        onChange={(event) =>
                          updateEmailPart("domain", event.target.value)
                        }
                        placeholder={t("volunteer.labels.emailDomain")}
                        className="placeholder:text-ink/40 flex-1 bg-transparent text-base text-ink focus:outline-none"
                      />
                    </div>
                  </FieldWrapper>
                )}
                {fieldSet.has("languages") && (
                  <SelectionGroup
                    field="languages"
                    title={t("volunteer.labels.languages")}
                    description={t("volunteer.helpers.languages")}
                  >
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {volunteerLanguageOptions.map((option) => {
                        const optionLabel = getLanguageLabel(option.labelKey);
                        return (
                          <SelectableCard
                            key={option.value}
                            label={optionLabel}
                            icon={
                              <FlagIconBox
                                code={option.flagCode}
                                label={optionLabel}
                              />
                            }
                            selected={selectedLanguages.includes(option.value)}
                            onClick={() =>
                              toggleMultiValue("languages", option.value)
                            }
                          />
                        );
                      })}
                    </div>
                  </SelectionGroup>
                )}
                {fieldSet.has("country") && (
                  <SelectionGroup
                    field="country"
                    title={t("volunteer.labels.country")}
                    description={t("volunteer.helpers.country")}
                  >
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {volunteerCountryOptions.map((option) => {
                        const optionLabel = getCountryLabel(option.labelKey);
                        return (
                          <SelectableCard
                            key={option.value}
                            label={optionLabel}
                            icon={
                              <FlagIconBox
                                code={option.flagCode}
                                label={optionLabel}
                              />
                            }
                            selected={selectedCountry === option.value}
                            onClick={() =>
                              form.setValue("country", option.value)
                            }
                          />
                        );
                      })}
                    </div>
                  </SelectionGroup>
                )}
                {fieldSet.has("city") && (
                  <FieldWrapper field="city">
                    <Input
                      {...form.register("city")}
                      placeholder={t("volunteer.labels.city")}
                      className={cn(fieldClasses, fieldIcons.city && "pl-12")}
                    />
                  </FieldWrapper>
                )}
                {fieldSet.has("skills") && (
                  <SelectionGroup
                    field="skills"
                    title={t("volunteer.labels.skills")}
                    description={t("volunteer.helpers.skills")}
                  >
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {volunteerSkillOptions.map((option) => {
                        const optionLabel = getSkillLabel(option.labelKey);
                        return (
                          <SelectableCard
                            key={option.value}
                            label={optionLabel}
                            selected={selectedSkills.includes(option.value)}
                            onClick={() =>
                              toggleMultiValue("skills", option.value)
                            }
                          />
                        );
                      })}
                    </div>
                    {showSkillOther ? (
                      <div className="mt-3">
                        <Input
                          {...form.register("skillOther")}
                          placeholder={t("volunteer.labels.skillOther")}
                          className={fieldClasses}
                        />
                      </div>
                    ) : null}
                  </SelectionGroup>
                )}
                {fieldSet.has("causes") && (
                  <SelectionGroup
                    field="causes"
                    title={t("volunteer.labels.causes")}
                    description={t("volunteer.helpers.causes")}
                  >
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {causeOptions.map((option) => (
                        <SelectableCard
                          key={option.value}
                          label={option.label}
                          selected={selectedCauses.includes(option.value)}
                          onClick={() =>
                            toggleMultiValue("causes", option.value)
                          }
                        />
                      ))}
                    </div>
                  </SelectionGroup>
                )}
                {fieldSet.has("preferredCountries") && (
                  <SelectionGroup
                    field="preferredCountries"
                    title={t("volunteer.labels.preferredCountries")}
                    description={t("volunteer.helpers.preferredCountries")}
                  >
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {volunteerCountryOptions.map((option) => {
                        const optionLabel = getCountryLabel(option.labelKey);
                        return (
                          <SelectableCard
                            key={option.value}
                            label={optionLabel}
                            icon={
                              <FlagIconBox
                                code={option.flagCode}
                                label={optionLabel}
                              />
                            }
                            selected={selectedPreferredCountries.includes(
                              option.value,
                            )}
                            onClick={() =>
                              toggleMultiValue(
                                "preferredCountries",
                                option.value,
                              )
                            }
                          />
                        );
                      })}
                    </div>
                  </SelectionGroup>
                )}
                {fieldSet.has("availability") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-ink">
                      {t("volunteer.labels.availability")}
                    </label>
                    <FieldWrapper field="availability">
                      <Select
                        value={form.watch("availability")}
                        onValueChange={(val) =>
                          form.setValue(
                            "availability",
                            val as FormValues["availability"],
                          )
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            selectTriggerClasses,
                            fieldIcons.availability && "pl-12",
                          )}
                        >
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
                    </FieldWrapper>
                  </div>
                )}
                {fieldSet.has("modality") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-ink">
                      {t("volunteer.labels.modality")}
                    </label>
                    <FieldWrapper field="modality">
                      <Select
                        value={form.watch("modality")}
                        onValueChange={(val) =>
                          form.setValue(
                            "modality",
                            val as FormValues["modality"],
                          )
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            selectTriggerClasses,
                            fieldIcons.modality && "pl-12",
                          )}
                        >
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
                    </FieldWrapper>
                  </div>
                )}
                {fieldSet.has("availableFrom") && (
                  <FieldWrapper field="availableFrom">
                    <Input
                      type="date"
                      {...form.register("availableFrom")}
                      className={cn(
                        fieldClasses,
                        fieldIcons.availableFrom && "pl-12",
                      )}
                    />
                  </FieldWrapper>
                )}
                {fieldSet.has("availableTo") && (
                  <FieldWrapper field="availableTo">
                    <Input
                      type="date"
                      {...form.register("availableTo")}
                      className={cn(
                        fieldClasses,
                        fieldIcons.availableTo && "pl-12",
                      )}
                    />
                  </FieldWrapper>
                )}
                {fieldSet.has("remoteOk") && (
                  <label className="flex items-center gap-2 text-base text-ink">
                    <Checkbox
                      checked={form.watch("remoteOk")}
                      onCheckedChange={(val) =>
                        form.setValue("remoteOk", Boolean(val))
                      }
                    />
                    <span className="flex items-center gap-2">
                      <InlineFieldIcon
                        field="remoteOk"
                        className="h-4 w-4 text-turquoise"
                      />
                      {t("volunteer.labels.remoteOk")}
                    </span>
                  </label>
                )}
                {fieldSet.has("consent") && (
                  <label className="flex items-center gap-2 text-base text-ink">
                    <Checkbox
                      checked={form.watch("consent")}
                      onCheckedChange={(val) =>
                        form.setValue("consent", Boolean(val))
                      }
                    />
                    <span className="flex items-center gap-2">
                      <InlineFieldIcon
                        field="consent"
                        className="h-4 w-4 text-orange"
                      />
                      {t("volunteer.labels.consent")}
                    </span>
                  </label>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="border-orange/40 h-12 rounded-full text-ink hover:text-orange sm:w-auto"
                  size="lg"
                >
                  {t("actions.back")}
                </Button>
                {isLast ? (
                  <Button
                    type="submit"
                    disabled={pending}
                    className="h-12 w-full rounded-full bg-orange px-8 text-white hover:bg-turquoise sm:w-auto"
                    size="lg"
                  >
                    {pending ? "..." : t("volunteer.labels.submit")}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="h-12 w-full rounded-full bg-orange px-8 text-white hover:bg-turquoise sm:w-auto"
                    size="lg"
                  >
                    {t("actions.next")}
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
