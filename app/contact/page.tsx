import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the PromptVerse AI team.",
};

export default function ContactPage() {
  return (
    <StaticPage title="Contact us">
      <p>We read every message. Email us for support, payment questions, feedback or business enquiries:</p>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
      <h2>Payment problems</h2>
      <p>
        If you paid for a premium prompt and it did not unlock, email us with the email
        address you used at checkout and your payment reference (it starts with
        &quot;pv_&quot;). We will fix it as quickly as we can.
      </p>
    </StaticPage>
  );
}
