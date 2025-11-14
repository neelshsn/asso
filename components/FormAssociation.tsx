"use client";

import { useMemo, useState, useTransition } from "react";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  Baby,
  GraduationCap,
  HandHelping,
  HeartHandshake,
  PawPrint,
  Stethoscope,
  Tent,
  Trees,
  UsersRound,
  UtensilsCrossed,
} from "lucide-react";

const answerValueSchema = z.union([z.string(), z.array(z.string())]);

const formSchema = z.object({
  category: z.string().min(1),
  categoryAnswers: z.record(z.string(), answerValueSchema),
  orgName: z.string().min(2),
  email: z.string().email(),
  website: z.string().optional(),
  social: z.string().optional(),
  legalStatus: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  modality: z.enum(["ONSITE", "REMOTE", "HYBRID"]),
  country: z.string().min(2),
  city: z.string().min(2),
  urgency: z.number().min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;
type FieldName = keyof FormValues;

type ChoiceOption = {
  label: string;
  value?: string;
};

type QuestionTag = "mission" | "skills" | "causes" | "description" | "consent";

type QuestionDefinition = {
  id: string;
  label: string;
  type: "text" | "single" | "multi";
  required?: boolean;
  long?: boolean;
  options?: ChoiceOption[];
  allowOther?: boolean;
  tags?: QuestionTag[];
};

type CategorySection = {
  id: string;
  title: string;
  description?: string;
  questions: QuestionDefinition[];
};

type CategoryDefinition = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  sections: CategorySection[];
};

type CategoryAnswers = Record<string, string | string[]>;

type WizardStep =
  | {
      key: string;
      title: string;
      description?: string;
      type: "category";
    }
  | {
      key: string;
      title: string;
      description?: string;
      type: "category-section";
      section: CategorySection;
    }
  | {
      key: string;
      title: string;
      description?: string;
      type: "form";
      fields: FieldName[];
    };

const modalities = [
  { value: "ONSITE", label: "On-site" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
];

const missionSectionDescription =
  "Notre objectif : mettre la bonne personne au bon endroit. Ciblons vos besoins et trouvons des solutions. Et surtout, le volontaire de vos reves ! Nos mots d'ordre : pertinence, humanite, besoins locaux.";

const yesNoOptions: ChoiceOption[] = [{ label: "Oui" }, { label: "Non" }];

const durationOptions: ChoiceOption[] = [
  { label: "Moins de 1 mois" },
  { label: "1 a 3 mois" },
  { label: "4 a 6 mois" },
  { label: "Long terme (6 mois et +)" },
];

const housingPresenceOptions: ChoiceOption[] = [
  { label: "Oui" },
  { label: "Non" },
  { label: "Selon la mission" },
];

const housingTypeOptions: ChoiceOption[] = [
  { label: "Collectif" },
  { label: "Famille d'accueil" },
  { label: "Independant" },
];

const formationOptions: ChoiceOption[] = [
  {
    label:
      "Oui, avant le depart ils doivent suivre une formation en ligne gratuite",
  },
  {
    label:
      "Oui, avant le depart ils doivent suivre une formation en physique dans nos bureaux gratuite",
  },
  { label: "Oui, sur place ils suivent une formation d'accueil" },
  {
    label: "Non, ils apprennent sur le terrain encadres par l'equipe",
  },
];

const languageOptions: ChoiceOption[] = [
  { label: "Francais" },
  { label: "Anglais" },
  { label: "Autre :", value: "other" },
];

const volunteersVolumeOptions: ChoiceOption[] = [
  { label: "1" },
  { label: "2-5" },
  { label: "6 et + car mission specifique" },
];

const dreamMatchOptions: ChoiceOption[] = [
  { label: "Oui" },
  { label: "Non, je prefere me debrouiller seule" },
];

const specializedVolunteerOptions: ChoiceOption[] = [
  {
    label:
      "Oui, on prend que des volontaires avec des competences professionnelles specialisees",
  },
  {
    label:
      "Non, ce n'est pas necessaire, la motivation et la sensibilite suffisent !",
  },
];

const standardIdentityFields: FieldName[] = [
  "orgName",
  "email",
  "website",
  "social",
  "legalStatus",
  "country",
  "city",
  "modality",
  "urgency",
  "startDate",
  "endDate",
];

const missionQuestion = (category: string): QuestionDefinition => ({
  id: `${category}-mission`,
  label: "N'GO : on vous aide comment ? *",
  type: "text",
  required: true,
  tags: ["mission"],
});

const expectationQuestion = (category: string): QuestionDefinition => ({
  id: `${category}-expectations`,
  label: "Qu'attendez-vous d'un volontaire exactement ? *",
  type: "text",
  required: true,
  long: true,
  tags: ["description"],
});

const durationQuestion = (category: string): QuestionDefinition => ({
  id: `${category}-duration`,
  label: "Quelle duree d'engagement preferez-vous ? *",
  type: "single",
  required: true,
  options: durationOptions,
});

const housingQuestion = (category: string): QuestionDefinition => ({
  id: `${category}-housing`,
  label: "Les volontaires sont-ils heberges sur place ? *",
  type: "single",
  required: true,
  options: housingPresenceOptions,
});

const housingTypeQuestion = (category: string): QuestionDefinition => ({
  id: `${category}-housing-type`,
  label: "Type d'hebergement propose : *",
  type: "single",
  required: true,
  options: housingTypeOptions,
});

const trainingQuestion = (category: string): QuestionDefinition => ({
  id: `${category}-training`,
  label: "Prevoyez-vous une formation d'accueil ou avant le depart ? *",
  type: "single",
  required: true,
  options: formationOptions,
});

const languageQuestion = (category: string): QuestionDefinition => ({
  id: `${category}-language`,
  label: "Langue necessaire ? *",
  type: "single",
  required: true,
  options: languageOptions,
  allowOther: true,
});

const volunteersCapacityQuestion = (category: string): QuestionDefinition => ({
  id: `${category}-volunteers`,
  label: "Combien de volontaires maximum simultanement ? *",
  type: "single",
  required: true,
  options: volunteersVolumeOptions,
});

const missionSpecificQuestion = (category: string): QuestionDefinition => ({
  id: `${category}-special-mission`,
  label:
    "Vous avez besoin de plusieurs volontaires pour une mission specifique, expliquez-nous de quoi il s'agit !",
  type: "text",
  long: true,
  tags: ["description"],
});

const dreamVolunteerQuestion = (category: string): QuestionDefinition => ({
  id: `${category}-dream`,
  label: "Souhaitez-vous que N'GO vous trouve le volontaire de vos reves ? *",
  type: "single",
  required: true,
  options: dreamMatchOptions,
});

const contractQuestion = (category: string): QuestionDefinition => ({
  id: `${category}-contract`,
  label:
    "Nous ne faisons venir les volontaires que SOUS CONTRAT pour s'assurer du bon deroulement de la mission. Etes-vous d'accord avec ca ? *",
  type: "single",
  required: true,
  options: yesNoOptions,
  tags: ["consent"],
});

const collaborationQuestion = (category: string): QuestionDefinition => ({
  id: `${category}-collaboration`,
  label:
    "Avez-vous deja collabore avec des volontaires ? Si oui, donnez-nous votre avis, racontez-nous l'experience, une anecdote, des points a soulever, d'eventuelles inquietudes *",
  type: "text",
  required: true,
  long: true,
  tags: ["description"],
});

const minorsQuestion = (category: string): QuestionDefinition => ({
  id: `${category}-minors`,
  label: "Est-ce que les volontaires mineurs sont acceptes ? *",
  type: "single",
  required: true,
  options: yesNoOptions,
});

const specializedQuestion = (
  category: string,
  label: string,
): QuestionDefinition => ({
  id: `${category}-specialized`,
  label,
  type: "single",
  required: true,
  options: specializedVolunteerOptions,
});

const categories: CategoryDefinition[] = [
  createHandicapCategory(),
  createRetraitesCategory(),
  createEcologieCategory(),
  createSdfCategory(),
  createEtudiantsCategory(),
  createRechercheCategory(),
  createAnimauxCategory(),
  createFamineCategory(),
  createIsolementCategory(),
  createOrphelinsCategory(),
  createFemmesCategory(),
];

const categoriesById = Object.fromEntries(
  categories.map((category) => [category.id, category] as const),
) as Record<string, CategoryDefinition>;

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
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>(
    {},
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      categoryAnswers: {},
      modality: "ONSITE",
      urgency: 5,
    },
  });

  const answers = (form.watch("categoryAnswers") ?? {}) as CategoryAnswers;
  const selectedCategory = form.watch("category");
  const categoryDefinition = selectedCategory
    ? categoriesById[selectedCategory]
    : undefined;

  const steps = useMemo<WizardStep[]>(() => {
    const entries: WizardStep[] = [
      {
        key: "category",
        title: "Choisissez votre cause prioritaire",
        description:
          "Des cartes cliquables pour declarer vos besoins par univers d'impact.",
        type: "category",
      },
    ];

    if (categoryDefinition) {
      categoryDefinition.sections.forEach((section) => {
        entries.push({
          key: `${categoryDefinition.id}-${section.id}`,
          title: section.title,
          description: section.description,
          type: "category-section",
          section,
        });
      });
    }

    entries.push({
      key: "identity",
      title: t("associationSteps.identity.title"),
      description: t("associationSteps.identity.description"),
      type: "form",
      fields: standardIdentityFields,
    });

    return entries;
  }, [categoryDefinition, t]);

  const totalSteps = steps.length;
  const step = steps[currentStep];
  const currentImage =
    associationImages[currentStep % associationImages.length];
  const fieldSet = new Set(
    step.type === "form" ? step.fields : ([] as FieldName[]),
  );
  const isLast = currentStep === totalSteps - 1;

  const handleCategorySelect = (categoryId: string) => {
    const previous = form.getValues("category");
    if (previous !== categoryId) {
      form.setValue("categoryAnswers", {});
      setQuestionErrors({});
    }
    form.setValue("category", categoryId);
    setCategoryError(null);
  };

  const clearError = (id: string) => {
    setQuestionErrors((prev) => {
      if (!prev[id]) return prev;
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const updateAnswerValue = (
    questionId: string,
    value: string | string[] | undefined,
  ) => {
    const current = {
      ...(form.getValues("categoryAnswers") as CategoryAnswers),
    };
    if (value === undefined || (Array.isArray(value) && value.length === 0)) {
      delete current[questionId];
    } else {
      current[questionId] = value;
    }
    form.setValue("categoryAnswers", current, { shouldDirty: true });
    clearError(questionId);
  };

  const handleNext = async () => {
    const activeStep = steps[currentStep];

    if (activeStep.type === "category") {
      if (!selectedCategory) {
        setCategoryError("Choisissez une categorie pour continuer.");
        return;
      }
    } else if (activeStep.type === "category-section") {
      const errors = validateSection(activeStep.section, answers);
      if (Object.keys(errors).length > 0) {
        setQuestionErrors(errors);
        return;
      }
    } else if (activeStep.type === "form") {
      const valid = await form.trigger(activeStep.fields);
      if (!valid) return;
    }

    setQuestionErrors({});
    setCategoryError(null);
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCategoryError(null);
    setQuestionErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSingleSelect = (
    question: QuestionDefinition,
    optionValue: string,
  ) => {
    updateAnswerValue(question.id, optionValue);
    if (question.allowOther && optionValue !== "other") {
      updateAnswerValue(`${question.id}__other`, undefined);
    }
  };

  const toggleMultiValue = (
    question: QuestionDefinition,
    optionValue: string,
  ) => {
    const current = answers[question.id];
    const list = Array.isArray(current) ? [...current] : [];
    if (list.includes(optionValue)) {
      const filtered = list.filter((value) => value !== optionValue);
      updateAnswerValue(
        question.id,
        filtered.length > 0 ? filtered : undefined,
      );
      if (optionValue === "other") {
        updateAnswerValue(`${question.id}__other`, undefined);
      }
    } else {
      list.push(optionValue);
      updateAnswerValue(question.id, list);
    }
  };

  const onSubmit = (values: FormValues) => {
    const category = categoriesById[values.category];
    if (!category) {
      toast.error("Choisissez une categorie pour terminer votre brief.");
      setCurrentStep(0);
      return;
    }

    const derived = buildSubmissionPayload(
      category,
      values.categoryAnswers as CategoryAnswers,
    );

    startTransition(async () => {
      try {
        const payload = {
          orgName: values.orgName,
          email: values.email,
          website: values.website,
          social: values.social,
          legalStatus: values.legalStatus,
          missionTitle: derived.missionTitle,
          description: derived.description,
          requiredSkills: derived.requiredSkills,
          causes: derived.causes,
          startDate: values.startDate || undefined,
          endDate: values.endDate || undefined,
          modality: values.modality,
          country: values.country,
          city: values.city,
          urgency: values.urgency,
          consent: derived.consent,
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
          category: "",
          categoryAnswers: {},
          modality: "ONSITE",
          urgency: 5,
          orgName: "",
          email: "",
          website: "",
          social: "",
          legalStatus: "",
          country: "",
          city: "",
          startDate: "",
          endDate: "",
        });
        setCurrentStep(0);
        setCategoryError(null);
        setQuestionErrors({});
      } catch (error) {
        console.error(error);
        toast.error(notify("error"));
      }
    });
  };

  const renderQuestion = (question: QuestionDefinition) => {
    const value = answers[question.id];
    const needsOtherInput = question.allowOther
      ? shouldShowOtherInput(question, value)
      : false;
    const otherValue =
      typeof answers[`${question.id}__other`] === "string"
        ? (answers[`${question.id}__other`] as string)
        : "";

    if (question.type === "text") {
      const textValue = typeof value === "string" ? value : "";
      if (question.long) {
        return (
          <>
            <Textarea
              value={textValue}
              onChange={(event) =>
                updateAnswerValue(question.id, event.target.value)
              }
              placeholder="Precisez votre reponse"
            />
            {questionErrors[question.id] ? (
              <p className="text-xs text-red-500">
                {questionErrors[question.id]}
              </p>
            ) : null}
          </>
        );
      }

      return (
        <>
          <Input
            value={textValue}
            onChange={(event) =>
              updateAnswerValue(question.id, event.target.value)
            }
            placeholder="Precisez votre reponse"
          />
          {questionErrors[question.id] ? (
            <p className="text-xs text-red-500">
              {questionErrors[question.id]}
            </p>
          ) : null}
        </>
      );
    }

    if (question.type === "single") {
      const activeValue = typeof value === "string" ? value : "";
      return (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {question.options?.map((option) => {
              const optionValue = option.value ?? option.label;
              const isActive = activeValue === optionValue;
              return (
                <button
                  key={optionValue}
                  type="button"
                  onClick={() => handleSingleSelect(question, optionValue)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left text-sm transition",
                    isActive
                      ? "bg-orange/10 border-orange text-orange"
                      : "border-ink/10 hover:border-orange/40",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {needsOtherInput ? (
            <div className="mt-3 space-y-1">
              <Input
                value={otherValue}
                onChange={(event) =>
                  updateAnswerValue(`${question.id}__other`, event.target.value)
                }
                placeholder="Precisez votre reponse"
              />
              {questionErrors[`${question.id}__other`] ? (
                <p className="text-xs text-red-500">
                  {questionErrors[`${question.id}__other`]}
                </p>
              ) : null}
            </div>
          ) : null}
          {questionErrors[question.id] ? (
            <p className="text-xs text-red-500">
              {questionErrors[question.id]}
            </p>
          ) : null}
        </>
      );
    }

    const currentValues = Array.isArray(value) ? value : [];
    return (
      <>
        <div className="grid gap-3 md:grid-cols-2">
          {question.options?.map((option) => {
            const optionValue = option.value ?? option.label;
            const isActive = currentValues.includes(optionValue);
            return (
              <button
                key={optionValue}
                type="button"
                onClick={() => toggleMultiValue(question, optionValue)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left text-sm transition",
                  isActive
                    ? "bg-turquoise/10 border-turquoise text-turquoise"
                    : "border-ink/10 hover:border-turquoise/40",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {needsOtherInput ? (
          <div className="mt-3 space-y-1">
            <Input
              value={otherValue}
              onChange={(event) =>
                updateAnswerValue(`${question.id}__other`, event.target.value)
              }
              placeholder="Precisez votre reponse"
            />
            {questionErrors[`${question.id}__other`] ? (
              <p className="text-xs text-red-500">
                {questionErrors[`${question.id}__other`]}
              </p>
            ) : null}
          </div>
        ) : null}
        {questionErrors[question.id] ? (
          <p className="text-xs text-red-500">{questionErrors[question.id]}</p>
        ) : null}
      </>
    );
  };

  const validateSection = (
    section: CategorySection,
    values: CategoryAnswers,
  ) => {
    const errors: Record<string, string> = {};

    section.questions.forEach((question) => {
      const rawValue = values[question.id];
      if (question.required && isEmptyAnswer(rawValue)) {
        errors[question.id] = "Champ requis";
      }

      if (
        question.allowOther &&
        shouldShowOtherInput(question, rawValue) &&
        !stringHasValue(values[`${question.id}__other`])
      ) {
        errors[`${question.id}__other`] = "Precisez votre reponse";
      }

      if (
        question.tags?.includes("consent") &&
        (typeof rawValue !== "string" ||
          !resolveChoiceValue(question, rawValue, values)
            .toLowerCase()
            .startsWith("oui"))
      ) {
        errors[question.id] =
          "Nous avons besoin d'un accord contractuel pour continuer.";
      }
    });

    return errors;
  };

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
                  <div className="flex flex-1 gap-2">
                    {steps.map((s, index) => (
                      <span
                        key={s.key}
                        className={cn(
                          "h-2 flex-1 rounded-full transition",
                          index <= currentStep ? "bg-orange" : "bg-orange/20",
                        )}
                      />
                    ))}
                  </div>
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

              {step.type === "category" ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      const isActive = category.id === selectedCategory;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleCategorySelect(category.id)}
                          className={cn(
                            "flex h-full flex-col gap-4 rounded-3xl border p-5 text-left transition",
                            isActive
                              ? "bg-orange/5 border-orange"
                              : "border-ink/10 hover:border-orange/40",
                          )}
                        >
                          <span className="bg-orange/10 flex h-14 w-14 items-center justify-center rounded-2xl text-orange">
                            <Icon className="h-7 w-7" />
                          </span>
                          <div className="space-y-2">
                            <p className="font-semibold text-ink">
                              {category.label}
                            </p>
                            <p className="text-ink/70 text-sm">
                              {category.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {categoryError ? (
                    <p className="text-sm text-red-500">{categoryError}</p>
                  ) : null}
                </div>
              ) : null}

              {step.type === "category-section" ? (
                <div className="space-y-6">
                  {step.section.questions.map((question) => (
                    <div key={question.id} className="space-y-3">
                      <p className="text-sm font-medium text-ink">
                        {question.label}
                      </p>
                      {renderQuestion(question)}
                    </div>
                  ))}
                </div>
              ) : null}

              {step.type === "form" ? (
                <div className="space-y-4">
                  {fieldSet.has("orgName") ? (
                    <Input
                      {...form.register("orgName")}
                      placeholder={t("association.labels.orgName")}
                    />
                  ) : null}
                  {fieldSet.has("email") ? (
                    <Input
                      type="email"
                      {...form.register("email")}
                      placeholder={t("association.labels.email")}
                    />
                  ) : null}
                  {fieldSet.has("website") ? (
                    <Input
                      {...form.register("website")}
                      placeholder={t("association.labels.website")}
                    />
                  ) : null}
                  {fieldSet.has("social") ? (
                    <Input
                      {...form.register("social")}
                      placeholder={t("association.labels.social")}
                    />
                  ) : null}
                  {fieldSet.has("legalStatus") ? (
                    <Input
                      {...form.register("legalStatus")}
                      placeholder={t("association.labels.legalStatus")}
                    />
                  ) : null}
                  {fieldSet.has("country") ? (
                    <Input
                      {...form.register("country")}
                      placeholder={t("association.labels.country")}
                    />
                  ) : null}
                  {fieldSet.has("city") ? (
                    <Input
                      {...form.register("city")}
                      placeholder={t("association.labels.city")}
                    />
                  ) : null}
                  {fieldSet.has("modality") ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-ink">
                        {t("association.labels.modality")}
                      </label>
                      <Select
                        value={form.watch("modality")}
                        onValueChange={(val) =>
                          form.setValue(
                            "modality",
                            val as FormValues["modality"],
                          )
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
                  ) : null}
                  {fieldSet.has("urgency") ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-ink">
                        {t("association.labels.urgency")} (
                        {form.watch("urgency")})
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
                  ) : null}
                  {fieldSet.has("startDate") ? (
                    <Input type="date" {...form.register("startDate")} />
                  ) : null}
                  {fieldSet.has("endDate") ? (
                    <Input type="date" {...form.register("endDate")} />
                  ) : null}
                </div>
              ) : null}

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
function shouldShowOtherInput(question: QuestionDefinition, value: unknown) {
  if (!question.allowOther) return false;
  if (Array.isArray(value)) {
    return value.includes("other");
  }
  return value === "other";
}

function stringHasValue(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function isEmptyAnswer(value: unknown) {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === "string") {
    return value.trim().length === 0;
  }
  return value === undefined || value === null;
}

function resolveChoiceValue(
  question: QuestionDefinition,
  rawValue: string,
  answers: CategoryAnswers,
) {
  if (rawValue === "other") {
    const otherValue = answers[`${question.id}__other`];
    return typeof otherValue === "string" && otherValue.trim()
      ? otherValue.trim()
      : "Autre";
  }

  const match = question.options?.find(
    (option) => (option.value ?? option.label) === rawValue,
  );
  return match?.label ?? rawValue;
}

function collectQuestionList(
  question: QuestionDefinition,
  answers: CategoryAnswers,
) {
  const rawValue = answers[question.id];
  if (Array.isArray(rawValue)) {
    return rawValue
      .map((value) => resolveChoiceValue(question, value, answers))
      .filter((value) => stringHasValue(value));
  }

  if (typeof rawValue === "string" && stringHasValue(rawValue)) {
    if (question.type === "text") {
      return [rawValue.trim()];
    }
    return [resolveChoiceValue(question, rawValue, answers)];
  }

  return [] as string[];
}

function formatQuestionValue(
  question: QuestionDefinition,
  answers: CategoryAnswers,
) {
  if (question.type === "text") {
    const rawValue = answers[question.id];
    return typeof rawValue === "string" ? rawValue : "";
  }

  if (question.type === "single") {
    const rawValue = answers[question.id];
    return typeof rawValue === "string"
      ? resolveChoiceValue(question, rawValue, answers)
      : "";
  }

  return collectQuestionList(question, answers).join(", ");
}

function buildSubmissionPayload(
  category: CategoryDefinition,
  answers: CategoryAnswers,
) {
  const descriptionParts: string[] = [];
  const skillSet = new Set<string>();
  const causeSet = new Set<string>([category.label]);
  let missionTitle = "";
  let consent = false;

  category.sections.forEach((section) => {
    section.questions.forEach((question) => {
      const formatted = formatQuestionValue(question, answers);
      if (!formatted) return;

      if (question.tags?.includes("mission")) {
        missionTitle = formatted;
      }

      if (question.type === "text" || question.tags?.includes("description")) {
        descriptionParts.push(`${question.label} ${formatted}`);
      }

      if (question.tags?.includes("skills")) {
        collectQuestionList(question, answers).forEach((entry) =>
          skillSet.add(entry),
        );
      }

      if (question.tags?.includes("causes")) {
        collectQuestionList(question, answers).forEach((entry) =>
          causeSet.add(entry),
        );
      }

      if (
        question.tags?.includes("consent") &&
        typeof answers[question.id] === "string"
      ) {
        const resolved = resolveChoiceValue(
          question,
          answers[question.id] as string,
          answers,
        );
        consent = resolved.toLowerCase().startsWith("oui");
      }
    });
  });

  return {
    missionTitle: missionTitle || `${category.label} - brief personnalise`,
    description: descriptionParts.length
      ? descriptionParts.join("\n")
      : category.description,
    requiredSkills: skillSet.size ? Array.from(skillSet) : [category.label],
    causes: Array.from(causeSet),
    consent,
  };
}

function textQuestion(
  id: string,
  label: string,
  extra: Partial<QuestionDefinition> = {},
): QuestionDefinition {
  return { id, label, type: "text", ...extra };
}

function singleQuestion(
  id: string,
  label: string,
  options: ChoiceOption[],
  extra: Partial<QuestionDefinition> = {},
): QuestionDefinition {
  return { id, label, type: "single", options, ...extra };
}

function multiQuestion(
  id: string,
  label: string,
  options: ChoiceOption[],
  extra: Partial<QuestionDefinition> = {},
): QuestionDefinition {
  return { id, label, type: "multi", options, ...extra };
}
function createHandicapCategory(): CategoryDefinition {
  return {
    id: "handicap",
    label: "Handicap",
    description:
      "Centres d'accueil et structures specialisees pour handicaps mentaux ou physiques.",
    icon: Accessibility,
    sections: [
      {
        id: "profil",
        title: "Profil & besoins",
        description: missionSectionDescription,
        questions: [
          missionQuestion("handicap"),
          singleQuestion(
            "handicap-type",
            "Quel type d'handicap accompagnez-vous ? *",
            [{ label: "Mental" }, { label: "Physique" }, { label: "Mixte" }],
            { required: true, tags: ["causes"] },
          ),
          singleQuestion(
            "handicap-public",
            "Quel public accueillez-vous ? *",
            [
              { label: "Enfants" },
              { label: "Adultes" },
              { label: "Tous ages" },
            ],
            { required: true, tags: ["causes"] },
          ),
          singleQuestion(
            "handicap-structure",
            "Quel est votre type de structure ? *",
            [
              { label: "Centre d'accueil" },
              { label: "Ecole specialisee" },
              { label: "Foyer / hebergement" },
              { label: "Autre :", value: "other" },
            ],
            { required: true, allowOther: true, tags: ["causes"] },
          ),
          multiQuestion(
            "handicap-help",
            "Quel type d'aide recherchez-vous principalement ? *",
            [
              { label: "Accompagnement quotidien" },
              { label: "Soutien educatif" },
              { label: "Animation / ateliers" },
              { label: "Aide logistique" },
              {
                label:
                  "Une aide financiere : des dons, des parrainages, pas tant des volontaires",
              },
            ],
            { required: true, tags: ["causes"] },
          ),
          specializedQuestion(
            "handicap",
            "Avez-vous besoin de volontaires formes specifiquement ? *",
          ),
          minorsQuestion("handicap"),
        ],
      },
      {
        id: "volontaires",
        title: "Profil volontaire",
        questions: [
          multiQuestion(
            "handicap-ideal",
            "Le volontaire ideal serait plutot : *",
            [
              { label: "Empathique" },
              { label: "Calme" },
              { label: "Creatif" },
              { label: "Experimente" },
            ],
            { required: true, tags: ["skills"] },
          ),
          expectationQuestion("handicap"),
          durationQuestion("handicap"),
          housingQuestion("handicap"),
          housingTypeQuestion("handicap"),
          trainingQuestion("handicap"),
          languageQuestion("handicap"),
        ],
      },
      {
        id: "logistique",
        title: "Organisation",
        questions: [
          volunteersCapacityQuestion("handicap"),
          missionSpecificQuestion("handicap"),
          textQuestion(
            "handicap-material",
            "Souhaitez-vous que les volontaires apportent du materiel specialise ? Si oui, quoi par exemple ? *",
            { required: true, long: true, tags: ["description"] },
          ),
          singleQuestion(
            "handicap-priority",
            "Quelle est votre priorite actuelle ? *",
            [
              { label: "Recruter des volontaires" },
              { label: "Financement" },
              { label: "Formation du personnel" },
            ],
            { required: true },
          ),
          dreamVolunteerQuestion("handicap"),
          contractQuestion("handicap"),
          collaborationQuestion("handicap"),
        ],
      },
    ],
  };
}
function createRetraitesCategory(): CategoryDefinition {
  return {
    id: "retraites",
    label: "Personnes retraitees",
    description:
      "Structures qui accompagnent les seniors et rompent l'isolement.",
    icon: HeartHandshake,
    sections: [
      {
        id: "actions",
        title: "Actions menees",
        description: missionSectionDescription,
        questions: [
          missionQuestion("retraites"),
          multiQuestion(
            "retraites-actions",
            "Quels types d'actions menez-vous ? *",
            [
              { label: "Visites a domicile" },
              { label: "Activites collectives" },
              { label: "Accompagnement medical / administratif" },
              { label: "Aide en maison de retraite" },
            ],
            { required: true, tags: ["causes"] },
          ),
          singleQuestion(
            "retraites-public",
            "Quel public accueillez-vous ? *",
            [
              { label: "Personnes isolees" },
              { label: "En perte d'autonomie" },
              { label: "Seniors actifs" },
            ],
            { required: true, tags: ["causes"] },
          ),
          multiQuestion(
            "retraites-needs",
            "Quels sont vos besoins prioritaires ? *",
            [
              { label: "Presence / ecoute" },
              { label: "Soins / accompagnement" },
              { label: "Animation / ateliers" },
              { label: "Logistique" },
              {
                label:
                  "Une aide financiere : des dons, des parrainages, pas tant des volontaires",
              },
            ],
            { required: true, tags: ["causes"] },
          ),
          singleQuestion(
            "retraites-special",
            "Avez-vous besoin de volontaires formes specifiquement a la gerontologie ? *",
            specializedVolunteerOptions,
            { required: true, tags: ["skills"] },
          ),
          minorsQuestion("retraites"),
        ],
      },
      {
        id: "engagement",
        title: "Volontaires",
        questions: [
          multiQuestion(
            "retraites-ideal",
            "Le volontaire ideal serait plutot : *",
            [
              { label: "Bienveillant" },
              { label: "Patient" },
              { label: "Sociable" },
              { label: "Autonome" },
            ],
            { required: true, tags: ["skills"] },
          ),
          expectationQuestion("retraites"),
          durationQuestion("retraites"),
          singleQuestion(
            "retraites-logistics",
            "Une aide logistique est-elle possible (repas, transport) ? *",
            housingPresenceOptions,
            { required: true },
          ),
          trainingQuestion("retraites"),
          languageQuestion("retraites"),
          volunteersCapacityQuestion("retraites"),
        ],
      },
      {
        id: "logistique",
        title: "Organisation",
        questions: [
          missionSpecificQuestion("retraites"),
          textQuestion(
            "retraites-material",
            "Souhaitez-vous que les volontaires apportent du materiel ou contribuent financierement ? Si oui, developpez *",
            { required: true, long: true, tags: ["description"] },
          ),
          dreamVolunteerQuestion("retraites"),
          contractQuestion("retraites"),
          collaborationQuestion("retraites"),
        ],
      },
    ],
  };
}
function createEcologieCategory(): CategoryDefinition {
  return {
    id: "ecologie",
    label: "Ecologie",
    description:
      "Associations qui agissent pour la reforestation, les oceans ou la faune.",
    icon: Trees,
    sections: [
      {
        id: "actions",
        title: "Terrain",
        description: missionSectionDescription,
        questions: [
          missionQuestion("ecologie"),
          multiQuestion(
            "ecologie-actions",
            "Quel type d'actions menez-vous ? *",
            [
              { label: "Reforestation" },
              { label: "Gestion des dechets" },
              { label: "Sensibilisation" },
              { label: "Protection animale" },
            ],
            { required: true, tags: ["causes"] },
          ),
          singleQuestion(
            "ecologie-zone",
            "Quelle est votre zone d'action ? *",
            [{ label: "Locale" }, { label: "Internationale" }],
            { required: true, tags: ["causes"] },
          ),
          multiQuestion(
            "ecologie-profile",
            "Le volontaire ideal serait plutot : *",
            [
              { label: "Terrain / physique" },
              { label: "Communication" },
              { label: "Organisation" },
              { label: "Scientifique" },
            ],
            { required: true, tags: ["skills"] },
          ),
          minorsQuestion("ecologie"),
          singleQuestion(
            "ecologie-climate",
            "Les conditions climatiques sont-elles difficiles ? *",
            yesNoOptions,
            { required: true },
          ),
        ],
      },
      {
        id: "volontaires",
        title: "Engagement",
        questions: [
          expectationQuestion("ecologie"),
          durationQuestion("ecologie"),
          housingQuestion("ecologie"),
          housingTypeQuestion("ecologie"),
          trainingQuestion("ecologie"),
          languageQuestion("ecologie"),
          volunteersCapacityQuestion("ecologie"),
        ],
      },
      {
        id: "logistique",
        title: "Logistique",
        questions: [
          missionSpecificQuestion("ecologie"),
          textQuestion(
            "ecologie-material",
            "Souhaitez-vous que les volontaires apportent du materiel ou contribuent financierement ? Si oui, quoi par exemple ? *",
            { required: true, long: true, tags: ["description"] },
          ),
          dreamVolunteerQuestion("ecologie"),
          contractQuestion("ecologie"),
          collaborationQuestion("ecologie"),
        ],
      },
    ],
  };
}
function createSdfCategory(): CategoryDefinition {
  return {
    id: "sdf",
    label: "SDF & maraudes",
    description:
      "Associations de rue, maraudes et accueils de jour pour personnes sans-abri.",
    icon: Tent,
    sections: [
      {
        id: "actions",
        title: "Terrain",
        description: missionSectionDescription,
        questions: [
          missionQuestion("sdf"),
          multiQuestion(
            "sdf-actions",
            "Quel type d'actions menez-vous ? *",
            [
              { label: "Maraudes" },
              { label: "Aide alimentaire" },
              { label: "Accueil de jour" },
              { label: "Accompagnement logement" },
            ],
            { required: true, tags: ["causes"] },
          ),
          minorsQuestion("sdf"),
          multiQuestion(
            "sdf-ideal",
            "Le volontaire ideal serait plutot : *",
            [
              { label: "Ecoute / empathie" },
              { label: "Organisation" },
              { label: "Reactivite" },
            ],
            { required: true, tags: ["skills"] },
          ),
        ],
      },
      {
        id: "engagement",
        title: "Engagement",
        questions: [
          expectationQuestion("sdf"),
          durationQuestion("sdf"),
          singleQuestion(
            "sdf-night",
            "Y-a-t-il des missions de nuit ? *",
            yesNoOptions,
            { required: true },
          ),
          housingQuestion("sdf"),
          singleQuestion(
            "sdf-food",
            "Les volontaires sont-ils nourris sur place ? *",
            housingPresenceOptions,
            { required: true },
          ),
          housingTypeQuestion("sdf"),
          trainingQuestion("sdf"),
          languageQuestion("sdf"),
          volunteersCapacityQuestion("sdf"),
        ],
      },
      {
        id: "logistique",
        title: "Organisation",
        questions: [
          missionSpecificQuestion("sdf"),
          textQuestion(
            "sdf-material",
            "Souhaitez-vous que les volontaires apportent du materiel ? Si oui, quoi par exemple ? *",
            { required: true, long: true, tags: ["description"] },
          ),
          singleQuestion(
            "sdf-priority",
            "Quelle est votre priorite actuelle ? *",
            [
              { label: "Recruter" },
              { label: "Sensibiliser" },
              { label: "Financer" },
            ],
            { required: true },
          ),
          dreamVolunteerQuestion("sdf"),
          contractQuestion("sdf"),
          collaborationQuestion("sdf"),
        ],
      },
    ],
  };
}
function createEtudiantsCategory(): CategoryDefinition {
  return {
    id: "etudiants",
    label: "Etudiants",
    description:
      "Programmes de bourses, mentorat et accompagnement des jeunes.",
    icon: GraduationCap,
    sections: [
      {
        id: "profil",
        title: "Beneficiaires",
        description: missionSectionDescription,
        questions: [
          missionQuestion("etudiants"),
          multiQuestion(
            "etudiants-beneficiaries",
            "Votre association agit surtout aupres des : *",
            [
              { label: "Lyceens" },
              { label: "Etudiants" },
              { label: "Jeunes diplomes" },
            ],
            { required: true, tags: ["causes"] },
          ),
          multiQuestion(
            "etudiants-help",
            "Quel type d'aide recherchez-vous principalement ? *",
            [
              { label: "Scolarite" },
              { label: "Hebergement" },
              { label: "Orientation" },
              {
                label:
                  "Une aide financiere : des dons, des parrainages, pas tant des volontaires",
              },
            ],
            { required: true, tags: ["causes"] },
          ),
          multiQuestion(
            "etudiants-zones",
            "Quelles sont vos zones d'action ? *",
            [
              { label: "Afrique" },
              { label: "Asie" },
              { label: "France" },
              { label: "Autre :", value: "other" },
            ],
            { required: true, allowOther: true, tags: ["causes"] },
          ),
          multiQuestion(
            "etudiants-volunteers",
            "Quels sont les volontaires recherches ? *",
            [
              { label: "Mentors / tuteurs" },
              { label: "Professeurs" },
              { label: "Gestion / communication" },
            ],
            { required: true, tags: ["skills"] },
          ),
          minorsQuestion("etudiants"),
        ],
      },
      {
        id: "engagement",
        title: "Volontaires",
        questions: [
          multiQuestion(
            "etudiants-ideal",
            "Le volontaire ideal serait plutot : *",
            [
              { label: "Pedagogue" },
              { label: "Inspirant" },
              { label: "Rigoureux" },
            ],
            { required: true, tags: ["skills"] },
          ),
          expectationQuestion("etudiants"),
          durationQuestion("etudiants"),
          housingQuestion("etudiants"),
          housingTypeQuestion("etudiants"),
          trainingQuestion("etudiants"),
          languageQuestion("etudiants"),
          volunteersCapacityQuestion("etudiants"),
        ],
      },
      {
        id: "logistique",
        title: "Organisation",
        questions: [
          missionSpecificQuestion("etudiants"),
          textQuestion(
            "etudiants-material",
            "Souhaitez-vous que les volontaires apportent du materiel ? Si oui, quoi par exemple ? *",
            { required: true, long: true, tags: ["description"] },
          ),
          singleQuestion(
            "etudiants-priority",
            "Quelle est votre objectif prioritaire ? *",
            [
              { label: "Accompagnement personnel" },
              { label: "Financement" },
              { label: "Developpement du reseau" },
            ],
            { required: true },
          ),
          dreamVolunteerQuestion("etudiants"),
          contractQuestion("etudiants"),
          collaborationQuestion("etudiants"),
        ],
      },
    ],
  };
}
function createRechercheCategory(): CategoryDefinition {
  return {
    id: "recherche",
    label: "Recherche & sante",
    description:
      "Fondations medicales, laboratoires solidaires ou Telethon local.",
    icon: Stethoscope,
    sections: [
      {
        id: "domaines",
        title: "Specialite",
        description: missionSectionDescription,
        questions: [
          missionQuestion("recherche"),
          multiQuestion(
            "recherche-domaines",
            "Quel est votre domaine de specialite ? *",
            [
              { label: "Maladies infectieuses" },
              { label: "Sante maternelle" },
              { label: "Sante mentale" },
              { label: "Autres cas", value: "other" },
            ],
            { required: true, allowOther: true, tags: ["causes"] },
          ),
          multiQuestion(
            "recherche-missions",
            "Quel est votre type de missions ? *",
            [
              { label: "Recherche" },
              { label: "Soins / prevention" },
              { label: "Sensibilisation / education sanitaire" },
              { label: "Autre :", value: "other" },
            ],
            { required: true, allowOther: true, tags: ["causes"] },
          ),
          singleQuestion(
            "recherche-competence",
            "Les volontaires non competents dans le milieu medical sont-ils acceptes ? *",
            yesNoOptions,
            { required: true },
          ),
          minorsQuestion("recherche"),
          multiQuestion(
            "recherche-profile",
            "Quel est votre profil de volontaire souhaite ? *",
            [
              { label: "Un professionnel" },
              { label: "Un etudiant dans la sante" },
              { label: "Un soutien logistique" },
            ],
            { required: true, tags: ["skills"] },
          ),
        ],
      },
      {
        id: "terrain",
        title: "Terrain",
        questions: [
          expectationQuestion("recherche"),
          singleQuestion(
            "recherche-environnement",
            "Quel est le type d'environnement dans lequel vous intervenez ? *",
            [
              { label: "Hopital" },
              { label: "Dispensaire" },
              { label: "Campagne / mobile" },
              { label: "Autre :", value: "other" },
            ],
            { required: true, allowOther: true, tags: ["description"] },
          ),
          singleQuestion(
            "recherche-sanitaire",
            "Les conditions sanitaires sont-elles difficiles ? *",
            yesNoOptions,
            { required: true },
          ),
          durationQuestion("recherche"),
          housingQuestion("recherche"),
          housingTypeQuestion("recherche"),
          trainingQuestion("recherche"),
          languageQuestion("recherche"),
          volunteersCapacityQuestion("recherche"),
        ],
      },
      {
        id: "logistique",
        title: "Organisation",
        questions: [
          missionSpecificQuestion("recherche"),
          textQuestion(
            "recherche-material",
            "Souhaitez-vous que les volontaires apportent du materiel medical ? Si oui, quoi par exemple ? *",
            { required: true, long: true, tags: ["description"] },
          ),
          singleQuestion(
            "recherche-priority",
            "Quelle est votre priorite actuelle ? *",
            [{ label: "Recruter" }, { label: "Former" }, { label: "Financer" }],
            { required: true },
          ),
          dreamVolunteerQuestion("recherche"),
          contractQuestion("recherche"),
          collaborationQuestion("recherche"),
        ],
      },
    ],
  };
}
function createAnimauxCategory(): CategoryDefinition {
  return {
    id: "animaux",
    label: "Animaux",
    description: "Refuges et sanctuaires pour animaux domestiques ou sauvages.",
    icon: PawPrint,
    sections: [
      {
        id: "profil",
        title: "Proteges",
        description: missionSectionDescription,
        questions: [
          missionQuestion("animaux"),
          multiQuestion(
            "animaux-species",
            "Votre association agit surtout aupres des : *",
            [
              { label: "Chiens / chats" },
              { label: "Animaux de ferme" },
              { label: "Animaux sauvages" },
              { label: "Autres cas", value: "other" },
            ],
            { required: true, allowOther: true, tags: ["causes"] },
          ),
          multiQuestion(
            "animaux-help",
            "Quel type d'aide recherchez-vous principalement ? *",
            [
              { label: "Soins / nourrissage" },
              { label: "Entretien du refuge" },
              { label: "Communication / adoption" },
              { label: "Logistique / transport" },
              {
                label:
                  "Une aide financiere : des dons, des parrainages, pas tant des volontaires",
              },
            ],
            { required: true, tags: ["causes"] },
          ),
          singleQuestion(
            "animaux-special",
            "Avez-vous besoin de volontaires formes aux soins animaliers ? *",
            specializedVolunteerOptions,
            { required: true, tags: ["skills"] },
          ),
          minorsQuestion("animaux"),
          multiQuestion(
            "animaux-ideal",
            "Le volontaire ideal serait plutot : *",
            [
              { label: "Patient et endurant" },
              { label: "Dynamique et joyeux" },
              { label: "Experimente" },
            ],
            { required: true, tags: ["skills"] },
          ),
          singleQuestion(
            "animaux-contact",
            "Quel est le niveau de contact avec les animaux : *",
            [
              { label: "Quotidien" },
              { label: "Occasionnel" },
              { label: "Indirect (administratif)" },
            ],
            { required: true, tags: ["description"] },
          ),
        ],
      },
      {
        id: "engagement",
        title: "Engagement",
        questions: [
          expectationQuestion("animaux"),
          durationQuestion("animaux"),
          singleQuestion(
            "animaux-population",
            "Combien d'animaux sont pris en charge simultanement ? *",
            [
              { label: "Moins de 10" },
              { label: "Entre 10 et 30" },
              { label: "Plus de 30" },
            ],
            { required: true },
          ),
          housingQuestion("animaux"),
          housingTypeQuestion("animaux"),
          trainingQuestion("animaux"),
          languageQuestion("animaux"),
          volunteersCapacityQuestion("animaux"),
        ],
      },
      {
        id: "logistique",
        title: "Organisation",
        questions: [
          missionSpecificQuestion("animaux"),
          textQuestion(
            "animaux-material",
            "Souhaitez-vous que les volontaires apportent du materiel ? Si oui, quoi par exemple ? *",
            { required: true, long: true, tags: ["description"] },
          ),
          singleQuestion(
            "animaux-priority",
            "Quelle est votre priorite actuelle ? *",
            [
              { label: "Soins" },
              { label: "Adoption" },
              { label: "Sensibilisation" },
              { label: "Construction d'infrastructures" },
            ],
            { required: true },
          ),
          dreamVolunteerQuestion("animaux"),
          contractQuestion("animaux"),
          collaborationQuestion("animaux"),
        ],
      },
    ],
  };
}
function createFamineCategory(): CategoryDefinition {
  return {
    id: "famine",
    label: "Famine",
    description: "ONG alimentaires et soutien agricole contre la malnutrition.",
    icon: UtensilsCrossed,
    sections: [
      {
        id: "profil",
        title: "Zone d'action",
        description: missionSectionDescription,
        questions: [
          missionQuestion("famine"),
          multiQuestion(
            "famine-regions",
            "Votre association intervient surtout en : *",
            [
              { label: "Afrique" },
              { label: "Asie" },
              { label: "Amerique latine" },
              { label: "Autres cas", value: "other" },
            ],
            { required: true, allowOther: true, tags: ["causes"] },
          ),
          multiQuestion(
            "famine-actions",
            "Quel type d'actions menez-vous ? *",
            [
              { label: "Distribution alimentaire" },
              { label: "Soutien agricole local" },
              { label: "Sensibilisation nutritionnelle" },
              { label: "Urgences humanitaires" },
            ],
            { required: true, tags: ["causes"] },
          ),
          multiQuestion(
            "famine-public",
            "Quel est le public concerne ? *",
            [
              { label: "Enfants" },
              { label: "Familles" },
              { label: "Communautes rurales" },
              { label: "Tous publics" },
            ],
            { required: true, tags: ["causes"] },
          ),
          singleQuestion(
            "famine-urgency",
            "Quel est le niveau d'urgence actuel ? *",
            [{ label: "Eleve" }, { label: "Modere" }, { label: "Faible" }],
            { required: true, tags: ["description"] },
          ),
          multiQuestion(
            "famine-volunteers",
            "Quel est le type de volontaire souhaite ? *",
            [
              { label: "Terrain / logistique" },
              { label: "Communication / sensibilisation" },
              { label: "Gestion / coordination" },
              { label: "Technique (agronomie, sante, etc.)" },
            ],
            { required: true, tags: ["skills"] },
          ),
          minorsQuestion("famine"),
        ],
      },
      {
        id: "engagement",
        title: "Engagement",
        questions: [
          expectationQuestion("famine"),
          singleQuestion(
            "famine-conditions",
            "Est-ce que les conditions sur le terrain sont difficiles ? *",
            yesNoOptions,
            { required: true },
          ),
          durationQuestion("famine"),
          housingQuestion("famine"),
          housingTypeQuestion("famine"),
          trainingQuestion("famine"),
          languageQuestion("famine"),
          volunteersCapacityQuestion("famine"),
        ],
      },
      {
        id: "logistique",
        title: "Organisation",
        questions: [
          missionSpecificQuestion("famine"),
          textQuestion(
            "famine-material",
            "Souhaitez-vous que les volontaires apportent du materiel ? Si oui, quoi par exemple ? *",
            { required: true, long: true, tags: ["description"] },
          ),
          dreamVolunteerQuestion("famine"),
          contractQuestion("famine"),
          collaborationQuestion("famine"),
        ],
      },
    ],
  };
}
function createIsolementCategory(): CategoryDefinition {
  return {
    id: "isolement",
    label: "Personnes isolees",
    description: "Visites et accompagnement social pour rompre la solitude.",
    icon: UsersRound,
    sections: [
      {
        id: "profil",
        title: "Beneficiaires",
        description: missionSectionDescription,
        questions: [
          missionQuestion("isolement"),
          multiQuestion(
            "isolement-public",
            "Quel type de personnes isolees accompagnez-vous ? *",
            [
              { label: "Jeunes" },
              { label: "Adultes" },
              { label: "Seniors" },
              { label: "Tous publics" },
            ],
            { required: true, tags: ["causes"] },
          ),
          multiQuestion(
            "isolement-nature",
            "Quelle est la nature de leur isolement ? *",
            [
              { label: "Social" },
              { label: "Familial" },
              { label: "Geographique" },
              { label: "Economique" },
            ],
            { required: true, tags: ["causes"] },
          ),
          multiQuestion(
            "isolement-help",
            "Quel type d'aide recherchez-vous principalement ? *",
            [
              { label: "Visites / presence" },
              { label: "Ecoute / soutien moral" },
              { label: "Accompagnement administratif" },
              { label: "Animation" },
              {
                label:
                  "Une aide financiere : des dons, des parrainages, pas tant des volontaires",
              },
            ],
            { required: true, tags: ["causes"] },
          ),
          specializedQuestion(
            "isolement",
            "Avez-vous besoin de volontaires formes specifiquement ? *",
          ),
          minorsQuestion("isolement"),
        ],
      },
      {
        id: "volontaires",
        title: "Profil volontaire",
        questions: [
          multiQuestion(
            "isolement-ideal",
            "Le volontaire ideal serait plutot : *",
            [
              { label: "Empathique" },
              { label: "Calme" },
              { label: "Organise" },
              { label: "Engage" },
            ],
            { required: true, tags: ["skills"] },
          ),
          expectationQuestion("isolement"),
          durationQuestion("isolement"),
          housingQuestion("isolement"),
          housingTypeQuestion("isolement"),
          trainingQuestion("isolement"),
          languageQuestion("isolement"),
          volunteersCapacityQuestion("isolement"),
        ],
      },
      {
        id: "logistique",
        title: "Organisation",
        questions: [
          missionSpecificQuestion("isolement"),
          dreamVolunteerQuestion("isolement"),
          contractQuestion("isolement"),
          collaborationQuestion("isolement"),
        ],
      },
    ],
  };
}
function createOrphelinsCategory(): CategoryDefinition {
  return {
    id: "orphelins",
    label: "Enfants & orphelins",
    description:
      "Maisons d'enfants, foyers ou structures de protection de l'enfance.",
    icon: Baby,
    sections: [
      {
        id: "profil",
        title: "Enfants accueillis",
        description: missionSectionDescription,
        questions: [
          missionQuestion("orphelins"),
          singleQuestion(
            "orphelins-structure",
            "Votre structure accueille principalement : *",
            [
              { label: "Des orphelins" },
              { label: "Des enfants victimes de violences" },
              { label: "Des enfants en situation d'abandon" },
              { label: "Autres cas", value: "other" },
            ],
            { required: true, allowOther: true, tags: ["causes"] },
          ),
          singleQuestion(
            "orphelins-age",
            "Quel age ont majoritairement les enfants que vous accompagnez ? *",
            [
              { label: "Moins de 6 ans" },
              { label: "6 - 12 ans" },
              { label: "13 - 18 ans" },
              { label: "Tous ages confondus" },
            ],
            { required: true, tags: ["causes"] },
          ),
          multiQuestion(
            "orphelins-help",
            "Quel type d'aide recherchez-vous principalement ? *",
            [
              { label: "Soutien educatif / scolaire" },
              { label: "Animation / loisirs" },
              { label: "Aide psychologique / ecoute" },
              { label: "Accompagnement administratif / logistique" },
              {
                label:
                  "Une aide financiere : des dons, des parrainages, pas tant des volontaires",
              },
            ],
            { required: true, tags: ["causes"] },
          ),
          specializedQuestion(
            "orphelins",
            "Avez-vous besoin de volontaires formes a la psychologie, pedagogie ou a la protection de l'enfance ? *",
          ),
          minorsQuestion("orphelins"),
          singleQuestion(
            "orphelins-interaction",
            "Les volontaires interagissent-ils directement avec les enfants ? *",
            [
              { label: "Oui, quotidiennement" },
              { label: "Par moments encadres" },
              { label: "Non, plutot en soutien administratif" },
            ],
            { required: true, tags: ["description"] },
          ),
        ],
      },
      {
        id: "volontaires",
        title: "Volontaires",
        questions: [
          multiQuestion(
            "orphelins-ideal",
            "Le volontaire ideal serait plutot : *",
            [
              { label: "Doux et patient" },
              { label: "Dynamique et joyeux" },
              { label: "Structure et fiable" },
              { label: "Forme a l'education / psychologie" },
            ],
            { required: true, tags: ["skills"] },
          ),
          expectationQuestion("orphelins"),
          durationQuestion("orphelins"),
          housingQuestion("orphelins"),
          housingTypeQuestion("orphelins"),
          trainingQuestion("orphelins"),
          singleQuestion(
            "orphelins-team",
            "Travail en equipe ou individuel ? *",
            [
              { label: "Equipe encadree" },
              { label: "Autonomie partielle" },
              { label: "Totalement autonome" },
            ],
            { required: true, tags: ["description"] },
          ),
          languageQuestion("orphelins"),
          volunteersCapacityQuestion("orphelins"),
        ],
      },
      {
        id: "logistique",
        title: "Organisation",
        questions: [
          missionSpecificQuestion("orphelins"),
          singleQuestion(
            "orphelins-urgency",
            "Niveau d'urgence de vos besoins : *",
            [{ label: "Eleve" }, { label: "Modere" }, { label: "Stable" }],
            { required: true },
          ),
          textQuestion(
            "orphelins-material",
            "Souhaitez-vous que les volontaires apportent du materiel ? Si oui, quoi par exemple ? *",
            { required: true, long: true, tags: ["description"] },
          ),
          dreamVolunteerQuestion("orphelins"),
          contractQuestion("orphelins"),
          collaborationQuestion("orphelins"),
        ],
      },
    ],
  };
}
function createFemmesCategory(): CategoryDefinition {
  return {
    id: "femmes",
    label: "Femmes",
    description:
      "Associations de soutien aux femmes victimes de violences ou meres seules.",
    icon: HandHelping,
    sections: [
      {
        id: "profil",
        title: "Beneficiaires",
        description: missionSectionDescription,
        questions: [
          missionQuestion("femmes"),
          multiQuestion(
            "femmes-public",
            "Votre association agit surtout aupres de : *",
            [
              { label: "Femmes victimes de violences conjugales" },
              { label: "Meres isolees" },
              { label: "Femmes victimes de violences sexuelles" },
              { label: "Autres cas", value: "other" },
            ],
            { required: true, allowOther: true, tags: ["causes"] },
          ),
          singleQuestion(
            "femmes-lieu",
            "Lieu d'accueil principal : *",
            [
              { label: "Centre d'hebergement" },
              { label: "Suivi a domicile" },
              { label: "Soutien psychologique / social" },
            ],
            { required: true, tags: ["causes"] },
          ),
          multiQuestion(
            "femmes-help",
            "Quel type d'aide recherchez-vous principalement ? *",
            [
              { label: "Soutien administratif" },
              { label: "Ecoute et accompagnement" },
              { label: "Formation / insertion / reinsertion" },
              { label: "Animation d'ateliers" },
              {
                label:
                  "Une aide financiere : des dons, des parrainages, pas tant des volontaires",
              },
            ],
            { required: true, tags: ["causes"] },
          ),
          specializedQuestion(
            "femmes",
            "Avez-vous besoin de volontaires formes a la psychologie ? *",
          ),
          singleQuestion(
            "femmes-legal",
            "Est-ce qu'une aide juridique est necessaire ? *",
            yesNoOptions,
            { required: true },
          ),
          minorsQuestion("femmes"),
        ],
      },
      {
        id: "volontaires",
        title: "Volontaires",
        questions: [
          multiQuestion(
            "femmes-ideal",
            "Le volontaire ideal serait plutot : *",
            [
              { label: "Empathique" },
              { label: "Dynamique et joyeux" },
              { label: "Experimente" },
            ],
            { required: true, tags: ["skills"] },
          ),
          expectationQuestion("femmes"),
          singleQuestion(
            "femmes-men",
            "Les volontaires hommes sont-ils acceptes ? *",
            yesNoOptions,
            { required: true },
          ),
          durationQuestion("femmes"),
          housingQuestion("femmes"),
          housingTypeQuestion("femmes"),
          trainingQuestion("femmes"),
          languageQuestion("femmes"),
          volunteersCapacityQuestion("femmes"),
        ],
      },
      {
        id: "logistique",
        title: "Organisation",
        questions: [
          missionSpecificQuestion("femmes"),
          singleQuestion(
            "femmes-needs",
            "Quels sont vos besoins principaux actuels ? *",
            [
              { label: "Ressources humaines" },
              { label: "Financement" },
              { label: "Communication" },
            ],
            { required: true },
          ),
          textQuestion(
            "femmes-material",
            "Souhaitez-vous que les volontaires apportent du materiel ? Si oui, quoi par exemple ? *",
            { required: true, long: true, tags: ["description"] },
          ),
          singleQuestion(
            "femmes-urgency",
            "Niveau d'urgence de vos besoins : *",
            [{ label: "Eleve" }, { label: "Modere" }, { label: "Stable" }],
            { required: true },
          ),
          dreamVolunteerQuestion("femmes"),
          contractQuestion("femmes"),
          collaborationQuestion("femmes"),
        ],
      },
    ],
  };
}
