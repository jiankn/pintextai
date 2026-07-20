import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/marketing/prose-page";

export const metadata: Metadata = { title: "Privacy Policy", description: "How PinTextAI collects, uses, retains, and protects account and generation data.", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return <ProsePage eyebrow="Legal · Effective July 20, 2026" title="Privacy Policy" intro="PinTextAI is designed to collect only the information needed to run a source-first writing workspace. This policy explains what is processed and what choices you have.">
    <h2>Information we process</h2><p>When you sign in, we receive your name, email address, profile image, and account identifier from Google. We store structured source snapshots you explicitly save, generation settings, generated copy, feedback, credit usage, and subscription state. Stripe processes payment-card details; PinTextAI does not store full card numbers.</p>
    <h2>Public URLs and AI generation</h2><p>When you preview a public URL, our server fetches a limited HTML response to extract structured metadata and a short content summary. Raw HTML is not saved. You can edit the preview before it is used. Confirmed source details and your settings may be sent to OpenAI to generate copy; API requests are configured without response storage where supported.</p>
    <h2>Infrastructure and security</h2><p>Cloudflare provides hosting, security verification, network services, and D1 storage. We use short-lived signed source tokens, request rate limits, restricted URL fetching, and access controls. No internet service can promise absolute security, but we limit both data collection and retention.</p>
    <h2>Retention and deletion</h2><p>Free accounts retain the latest 20 completed generations; Pro history is intended to remain available for up to 12 months. Security counters expire automatically. You may delete individual sources and generations from the workspace. Account deletion requests remove account-linked content subject to limited legal, fraud-prevention, and billing record obligations.</p>
    <h2>Your choices</h2><p>You can avoid creating an account by using the one-time anonymous generation. You can edit or delete saved sources, manage billing in Stripe Customer Portal, and request access, correction, export, or deletion by emailing <a href="mailto:privacy@pintextai.com">privacy@pintextai.com</a>.</p>
    <h2>Contact and changes</h2><p>Questions can be sent through the <Link href="/contact">contact page</Link>. Material changes will be reflected here with a revised effective date.</p>
  </ProsePage>;
}
