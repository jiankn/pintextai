import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus, ShieldCheck, Sparkles } from "lucide-react";
import { CheckoutButton } from "@/components/marketing/checkout-button";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Start free with 5 daily PinTextAI credits or upgrade to Pro for batch generation and 1,000 monthly credits.",
  alternates: { canonical: "/pricing" },
};

const rows = [
  ["Credits", "5 per day", "1,000 per month"],
  ["Outputs per credit", "10", "10"],
  ["Generation history", "Latest 20", "12 months"],
  ["Batch workbench", "—", "Up to 50 rows"],
  ["CSV export", "—", "Included"],
  ["Brand profiles", "1", "Multiple"],
] as const;

export default function PricingPage() {
  return (
    <main id="main-content" className="site-container py-14 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow"><Sparkles aria-hidden="true" size={14} /> Clear, credit-based pricing</p>
        <h1 className="display-font mt-5 text-4xl leading-tight sm:text-6xl">Create consistently. Upgrade when volume grows.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-[var(--muted-ink)]">One credit creates a set of 10 editable options. Source previews are deterministic and never consume a credit.</p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-2">
        <section className="surface-card p-6 sm:p-8">
          <p className="text-sm font-extrabold text-[var(--muted-ink)]">Free</p>
          <div className="mt-3 flex items-end gap-2"><span className="display-font text-5xl">$0</span><span className="pb-2 text-sm text-[var(--muted-ink)]">forever</span></div>
          <p className="mt-4 text-sm text-[var(--muted-ink)]">For trying the workflow and maintaining a light publishing cadence.</p>
          <Link href="/pin-title-generator" className="secondary-button mt-7 w-full">Generate your first set</Link>
          <ul className="mt-7 grid gap-3 text-sm font-semibold">
            {["5 credits every day", "All four generators", "First generation without sign-up", "Saved history after Google sign-in"].map((item) => <li key={item} className="flex gap-2"><Check aria-hidden="true" size={18} className="mt-0.5 text-[var(--cherry)]" />{item}</li>)}
          </ul>
        </section>

        <section className="surface-card relative border-[color:var(--cherry)]/30 p-6 shadow-[var(--shadow-md)] sm:p-8">
          <span className="absolute right-5 top-5 rounded-full bg-[var(--cherry)] px-3 py-1 text-xs font-extrabold text-white">Best for operators</span>
          <p className="text-sm font-extrabold text-[var(--cherry-hover)]">Pro</p>
          <div className="mt-3 flex items-end gap-2"><span className="display-font text-5xl">$19</span><span className="pb-2 text-sm text-[var(--muted-ink)]">per month</span></div>
          <p className="mt-4 text-sm text-[var(--muted-ink)]">For sellers, bloggers, and marketers producing Pins across a content catalog.</p>
          <div className="mt-7"><CheckoutButton interval="month">Start Pro monthly</CheckoutButton></div>
          <div className="mt-3"><CheckoutButton interval="year">Choose annual · $180/year</CheckoutButton></div>
          <ul className="mt-7 grid gap-3 text-sm font-semibold">
            {["1,000 credits per billing month", "50-row batch workbench and CSV export", "12-month generation history", "Reusable sources and brand profiles"].map((item) => <li key={item} className="flex gap-2"><Check aria-hidden="true" size={18} className="mt-0.5 text-[var(--cherry)]" />{item}</li>)}
          </ul>
        </section>
      </div>

      <section className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-[20px] border border-[var(--border)] bg-white">
        <h2 className="p-5 text-xl font-extrabold sm:p-6">Compare plans</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <thead><tr className="border-t border-[var(--border)] bg-[var(--canvas)]"><th className="p-4 font-extrabold">Capability</th><th className="p-4 font-extrabold">Free</th><th className="p-4 font-extrabold text-[var(--cherry-hover)]">Pro</th></tr></thead>
            <tbody>{rows.map(([name, free, pro]) => <tr key={name} className="border-t border-[var(--border)]"><th className="p-4 font-semibold">{name}</th><td className="p-4 text-[var(--muted-ink)]">{free === "—" ? <Minus aria-label="Not included" size={17} /> : free}</td><td className="p-4 font-semibold">{pro}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-[20px] bg-[var(--sage)] p-5 text-sm text-[#35502f]">
        <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0" size={20} />
        <p><strong>Billing stays predictable.</strong> PinTextAI never silently switches plans. Pro access begins only after Stripe confirms payment, and you can manage renewal in Stripe Customer Portal.</p>
      </div>
    </main>
  );
}
