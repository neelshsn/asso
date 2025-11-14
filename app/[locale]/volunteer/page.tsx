import { FormVolunteer } from "@/components/FormVolunteer";

export default function VolunteerPage() {
  const googleFormUrl = process.env.GOOGLE_FORM_VOLUNTEER;

  return (
    <section className="min-h-[100dvh] w-full">
      <FormVolunteer googleFormUrl={googleFormUrl} />
    </section>
  );
}
