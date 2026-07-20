import type { Metadata } from "next";
import { ProsePage } from "@/components/marketing/prose-page";

export const metadata: Metadata = { title: "Terms of Service", description: "Terms governing use of PinTextAI.", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return <ProsePage eyebrow="Legal · Effective July 20, 2026" title="Terms of Service" intro="These terms govern your use of PinTextAI.com and its source preview, AI writing, workspace, and billing features.">
    <h2>Using the service</h2><p>You must be able to form a binding agreement and must use the service lawfully. You are responsible for the URLs, source material, settings, and copy you submit or publish. Do not use PinTextAI to access private networks, evade access controls, infringe rights, distribute malware, or mislead people.</p>
    <h2>AI output and review</h2><p>AI output can be incomplete or incorrect. You must review claims, keywords, intellectual-property concerns, platform rules, and legal compliance before publishing. PinTextAI does not promise reach, traffic, ranking, sales, or Pinterest approval.</p>
    <h2>Accounts and credits</h2><p>Credits are usage allowances, not currency, and cannot be transferred or redeemed for cash. Free allowances may reset or change to protect the service. Paid plan changes apply as described at checkout and after payment confirmation. Abuse, automation that bypasses limits, or shared access may result in suspension.</p>
    <h2>Subscriptions</h2><p>Pro subscriptions renew until canceled. Price, interval, and renewal details are shown in Stripe Checkout. You can manage cancellation and payment details through Stripe Customer Portal. Except where law requires otherwise, completed billing periods and consumed credits are non-refundable.</p>
    <h2>Ownership</h2><p>You retain rights you have in your input and, as between you and PinTextAI, may use generated output subject to applicable law and third-party rights. PinTextAI retains rights in the service, software, prompts, design system, and documentation.</p>
    <h2>Service availability and liability</h2><p>The service is provided on an “as available” basis. To the maximum extent permitted by law, PinTextAI disclaims implied warranties and is not liable for indirect, consequential, or lost-profit damages. Aggregate liability is limited to the amount you paid PinTextAI in the prior three months.</p>
    <h2>Independent product</h2><p>PinTextAI is independent and is not affiliated with, endorsed by, or sponsored by Pinterest. Pinterest is a trademark of its owner. You remain responsible for complying with Pinterest’s current policies.</p>
    <h2>Contact</h2><p>Questions about these terms may be sent to <a href="mailto:legal@pintextai.com">legal@pintextai.com</a>.</p>
  </ProsePage>;
}
