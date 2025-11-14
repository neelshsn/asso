"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export type MatchSettingsFormValues = {
  threshold: number;
  weights: {
    skills: number;
    causes: number;
    availability: number;
    language: number;
    modality: number;
  };
};

export function MatchSettingsForm({
  initial,
}: {
  initial: MatchSettingsFormValues;
}) {
  const [values, setValues] = useState(initial);
  const [pending, setPending] = useState(false);

  const handleChange = (
    key: keyof MatchSettingsFormValues["weights"] | "threshold",
    value: number,
  ) => {
    if (key === "threshold") {
      setValues((prev) => ({ ...prev, threshold: value }));
    } else {
      setValues((prev) => ({
        ...prev,
        weights: { ...prev.weights, [key]: value },
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Settings saved");
    } catch (error) {
      console.error(error);
      toast.error("Unable to save");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-ink">
        Threshold
        <Input
          type="number"
          min={0}
          max={100}
          value={values.threshold}
          onChange={(event) =>
            handleChange("threshold", Number(event.target.value))
          }
        />
      </label>
      {Object.entries(values.weights).map(([key, value]) => (
        <label key={key} className="block text-sm font-medium text-ink">
          {key}
          <Input
            type="number"
            step="0.05"
            value={value}
            onChange={(event) =>
              handleChange(
                key as keyof MatchSettingsFormValues["weights"],
                Number(event.target.value),
              )
            }
          />
        </label>
      ))}
      <Button type="submit" disabled={pending} className="bg-teal rounded-full">
        {pending ? "…" : "Save"}
      </Button>
    </form>
  );
}
