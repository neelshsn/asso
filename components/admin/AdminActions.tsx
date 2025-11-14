"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTransition } from "react";

async function post(url: string, body?: Record<string, unknown>) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}

export function AdminActions() {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        disabled={pending}
        className="rounded-full bg-orange text-white hover:bg-turquoise"
        onClick={() =>
          startTransition(async () => {
            try {
              await post("/api/match/run");
              toast.success("Matching started");
            } catch (error) {
              console.error(error);
              toast.error("Unable to run matching");
            }
          })
        }
      >
        Run matching now
      </Button>
      <Button
        variant="outline"
        className="border-orange/40 rounded-full text-ink hover:text-orange"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              await post("/api/match/notify");
              toast.success("Emails queued");
            } catch (error) {
              console.error(error);
              toast.error("Unable to notify");
            }
          })
        }
      >
        Resend proposals
      </Button>
    </div>
  );
}
