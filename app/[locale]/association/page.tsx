import { FormAssociation } from "@/components/FormAssociation";

export default function AssociationPage() {
  const googleFormUrl = process.env.GOOGLE_FORM_ASSOC;

  return (
    <section className="min-h-[100dvh] w-full">
      <FormAssociation googleFormUrl={googleFormUrl} />
    </section>
  );
}
