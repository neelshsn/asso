import { Hero } from "@/components/Hero";
import { FAQ } from "@/components/FAQ";
import { WhoWeAre } from "@/components/WhoWeAre";
import { ValueCards } from "@/components/ValueCards";
import { PulseStats } from "@/components/PulseStats";
import { ContactPanel } from "@/components/ContactPanel";

export default async function LandingPage() {
  return (
    <div className="flex flex-col gap-16">
      <Hero />
      <PulseStats />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 md:px-0">
        <WhoWeAre />
        <ValueCards />
        <FAQ />
        <ContactPanel />
      </div>
    </div>
  );
}
