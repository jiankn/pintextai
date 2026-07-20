import type { Metadata } from "next";
import { Clock3, Mail, ShieldQuestion } from "lucide-react";

export const metadata: Metadata = { title: "Contact", description: "Contact PinTextAI about product help, privacy, or billing.", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return <main id="main-content" className="site-container py-14 sm:py-20"><div className="mx-auto max-w-4xl"><div className="max-w-2xl"><p className="eyebrow"><Mail aria-hidden="true" size={14} /> Contact PinTextAI</p><h1 className="display-font mt-5 text-4xl sm:text-5xl">Tell us what you’re trying to create</h1><p className="mt-4 text-lg text-[var(--muted-ink)]">Include the generator, source type, and exact error message when asking for product help. Never email API keys, passwords, or payment-card details.</p></div>
    <div className="mt-10 grid gap-5 sm:grid-cols-2"><a href="mailto:support@pintextai.com?subject=PinTextAI%20support" className="surface-card p-6 transition-shadow hover:shadow-[var(--shadow-md)]"><span className="grid size-11 place-items-center rounded-[18px] bg-[var(--blush)] text-[var(--cherry)]"><Mail aria-hidden="true" size={20} /></span><h2 className="mt-5 text-xl font-extrabold">Product and billing help</h2><p className="mt-2 text-sm text-[var(--muted-ink)]">support@pintextai.com</p></a><a href="mailto:privacy@pintextai.com?subject=Privacy%20request" className="surface-card p-6 transition-shadow hover:shadow-[var(--shadow-md)]"><span className="grid size-11 place-items-center rounded-[18px] bg-[var(--sage)] text-[#35502f]"><ShieldQuestion aria-hidden="true" size={20} /></span><h2 className="mt-5 text-xl font-extrabold">Privacy request</h2><p className="mt-2 text-sm text-[var(--muted-ink)]">privacy@pintextai.com</p></a></div>
    <p className="mt-6 flex items-center gap-2 text-sm text-[var(--muted-ink)]"><Clock3 aria-hidden="true" size={17} /> We aim to answer within two business days. No live-chat claim is made.</p></div></main>;
}
