import cron from "node-cron";
import { notifyMatches, widenScopeAndMatch } from "@/lib/match";

const globalForCron = globalThis as unknown as {
  matchCron?: import("node-cron").ScheduledTask;
};

export function ensureCron() {
  if (globalForCron.matchCron || process.env.NODE_ENV === "test") {
    return globalForCron.matchCron;
  }

  globalForCron.matchCron = cron.schedule("0 7 * * *", async () => {
    try {
      const result = await widenScopeAndMatch();
      if ("matchIds" in result && result.matchIds?.length) {
        await notifyMatches(result.matchIds);
      }
    } catch (error) {
      console.error("Cron job failed", error);
    }
  });

  return globalForCron.matchCron;
}

ensureCron();
