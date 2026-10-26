import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";
import { CONTACT_EMAIL, LEGAL_UPDATED } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How PromptVerse AI collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy Policy" updated={LEGAL_UPDATED}>
      <p>
        This policy explains what information PromptVerse AI (&quot;we&quot;, &quot;us&quot;) collects
        when you use our website, and how we use it. We aim to handle personal data in
        line with applicable data protection laws, including the Nigeria Data Protection
        Act 2023.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Account information:</strong> your name and email address when you register.</li>
        <li><strong>Payment information:</strong> the email you use at checkout, the prompt purchased, the amount and a payment reference. Card and bank details are handled by Paystack and are never stored by us.</li>
        <li><strong>Usage information:</strong> which prompts are viewed, searches and unlock activity, linked to an anonymous session identifier.</li>
        <li><strong>Cookies:</strong> a sign-in session cookie, and a cookie that remembers prompts you have unlocked as a guest.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To provide the service, unlock premium prompts and show your purchase history.</li>
        <li>To confirm payments and prevent fraud or abuse.</li>
        <li>To understand which prompts are useful and improve the website.</li>
        <li>To respond to your messages.</li>
      </ul>

      <h2>Advertising</h2>
      <p>
        We may show advertisements provided by Google, including Google AdSense. Google
        and its partners may use cookies to serve ads based on your visits to this and
        other websites. You can manage personalised advertising in your Google Ad
        Settings at adssettings.google.com. Advertisements are labelled as such.
      </p>

      <h2>Service providers</h2>
      <p>
        We use trusted providers to run the website: Supabase (database and sign-in),
        Netlify (hosting), Paystack (payments) and Google (advertising). They process
        data only as needed to provide their services.
      </p>

      <h2>Data retention and your rights</h2>
      <p>
        We keep account and purchase records for as long as needed to provide the service
        and meet legal and accounting obligations. You may ask us to access, correct or
        delete your personal data by emailing us. We will respond within a reasonable time.
      </p>

      <h2>Children</h2>
      <p>The service is not directed at children under 13, and we do not knowingly collect their data.</p>

      <h2>Changes</h2>
      <p>We may update this policy. The date at the top shows when it was last changed.</p>

      <h2>Contact</h2>
      <p>
        Privacy questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </StaticPage>
  );
}
