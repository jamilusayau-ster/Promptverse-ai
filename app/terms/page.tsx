import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";
import { CONTACT_EMAIL, LEGAL_UPDATED } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using PromptVerse AI.",
};

export default function TermsPage() {
  return (
    <StaticPage title="Terms of Service" updated={LEGAL_UPDATED}>
      <p>
        By using PromptVerse AI you agree to these terms. If you do not agree, please do
        not use the website.
      </p>

      <h2>The service</h2>
      <p>
        PromptVerse AI provides a library of AI prompts. Free prompts are available to
        everyone. Premium prompts are unlocked by a one-time payment per prompt.
      </p>

      <h2>Accounts</h2>
      <p>
        You are responsible for your account and for keeping your password secure. Give
        us accurate information and do not share your account.
      </p>

      <h2>Payments and refunds</h2>
      <p>
        Prices are shown in Nigerian Naira (₦) and paid through Paystack. Premium prompts
        are digital content delivered immediately after payment is confirmed. Because of
        this, payments are generally non-refundable once a prompt has been unlocked.
        If you were charged but did not receive your prompt, or were charged twice for
        the same prompt, contact us and we will correct it or refund you.
      </p>

      <h2>Your licence to use prompts</h2>
      <p>
        You may use prompts for your own personal and commercial creations. You may not
        resell, redistribute, publish or share the prompt text itself (free or premium)
        as your own product, or bypass the unlock system.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not attempt to access premium content without paying, or interfere with payments or security.</li>
        <li>Do not scrape, copy in bulk or republish the library.</li>
        <li>Do not use the prompts to create unlawful, harmful or deceptive content.</li>
      </ul>

      <h2>No guarantee of results</h2>
      <p>
        AI tools vary and change. We do not guarantee that a prompt will produce any
        particular result. The service is provided &quot;as is&quot;, and to the extent permitted by
        law we are not liable for indirect or consequential losses.
      </p>

      <h2>Advertising</h2>
      <p>The website may display third-party advertisements. We are not responsible for third-party sites or advertisers.</p>

      <h2>Suspension and changes</h2>
      <p>
        We may suspend accounts that break these terms, and we may update these terms
        or the service. Continued use after changes means you accept them.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>

      <h2>Contact</h2>
      <p>
        Questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </StaticPage>
  );
}
