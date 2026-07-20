import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight, CalendarClock, Check, CreditCard, Zap } from "lucide-react";
import { PortalButton } from "@/components/dashboard/portal-button";
import { getSessionFromHeaders } from "@/lib/auth";
import { getAppEnv } from "@/lib/cloudflare";

async function getBillingState() {
  const session = await getSessionFromHeaders(await headers());
  if (!session?.user) return { plan: "free", used: 0, limit: 5, hasCustomer: false, status: "demo" };
  const env = await getAppEnv();
  if (!env.DB) return { plan: "free", used: 0, limit: 5, hasCustomer: false, status: "unavailable" };
  const account = await env.DB.prepare("SELECT plan FROM user WHERE id = ? LIMIT 1").bind(session.user.id).first<{ plan: string }>();
  const plan = account?.plan === "pro" || account?.plan === "business" ? account.plan : "free";
  const monthly = plan !== "free";
  const period = new Date().toISOString().slice(0, monthly ? 7 : 10);
  const usage = await env.DB.prepare(
    monthly
      ? "SELECT used, limit_value FROM usage_monthly WHERE user_id = ? AND period = ?"
      : "SELECT used, limit_value FROM usage_daily WHERE subject_id = ? AND usage_date = ?",
  ).bind(session.user.id, period).first<{ used: number; limit_value: number }>();
  const subscription = await env.DB.prepare("SELECT status FROM subscriptions WHERE user_id = ? LIMIT 1").bind(session.user.id).first<{ status: string }>();
  return { plan, used: usage?.used || 0, limit: usage?.limit_value || (plan === "business" ? 4000 : plan === "pro" ? 1000 : 5), hasCustomer: Boolean(subscription), status: subscription?.status || "free" };
}

export default async function BillingPage() {
  const billing = await getBillingState();
  const percent = Math.min(100, Math.round((billing.used / billing.limit) * 100));
  return (
    <div className="mx-auto max-w-5xl"><div><p className="eyebrow"><CreditCard aria-hidden="true" size={14} /> Plan and credits</p><h1 className="display-font mt-3 text-3xl sm:text-4xl">Billing</h1><p className="mt-2 text-sm text-[var(--muted-ink)]">Subscription access changes only after a verified Stripe webhook.</p></div>
      <div className="mt-7 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-card p-6 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="rounded-full bg-[var(--sage)] px-3 py-1 text-xs font-extrabold capitalize text-[#35502f]">{billing.plan} plan</span><h2 className="mt-4 text-2xl font-extrabold">{billing.limit.toLocaleString()} credits {billing.plan === "free" ? "every day" : "each month"}</h2><p className="mt-2 text-sm text-[var(--muted-ink)]">Resets at 00:00 UTC. One completed set of 10 outputs uses one credit.</p></div><span className="grid size-12 place-items-center rounded-[18px] bg-[var(--blush)] text-[var(--cherry)]"><Zap aria-hidden="true" size={22} /></span></div><div className="mt-7"><div className="flex justify-between text-sm font-bold"><span>Credits used this {billing.plan === "free" ? "day" : "period"}</span><span className="tabular-nums">{billing.used.toLocaleString()} / {billing.limit.toLocaleString()}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--border)]"><div className="h-full rounded-full bg-[var(--cherry)]" style={{ width: `${percent}%` }} /></div></div>{billing.plan === "free" && <Link href="/pricing" className="primary-button mt-7">Upgrade to Pro <ArrowRight aria-hidden="true" size={17} /></Link>}</section>
        <section className="surface-card p-6 sm:p-7"><span className="grid size-12 place-items-center rounded-[18px] bg-[var(--lavender)]"><CalendarClock aria-hidden="true" size={22} /></span><h2 className="mt-5 text-xl font-extrabold">Manage subscription</h2><p className="mt-2 text-sm text-[var(--muted-ink)]">Update payment details, view invoices, or cancel through Stripe Customer Portal.</p>{billing.hasCustomer ? <PortalButton /> : <p className="mt-6 rounded-2xl bg-[var(--canvas)] p-4 text-sm text-[var(--muted-ink)]">A Customer Portal link appears after you begin checkout.</p>}<p className="mt-3 text-xs capitalize text-[var(--muted-ink)]">Billing status: {billing.status.replaceAll("_", " ")}</p></section>
      </div>
      <section className="surface-card mt-5 p-6 sm:p-7"><h2 className="text-xl font-extrabold">What Pro unlocks</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{["1,000 credits each billing month", "50-row batch workbench", "CSV export", "12-month generation history", "Advanced vibes and brand profiles", "Priority cost-controlled generation"].map((item) => <p key={item} className="flex items-center gap-2 text-sm font-semibold"><Check aria-hidden="true" size={17} className="text-[var(--cherry)]" /> {item}</p>)}</div></section>
    </div>
  );
}
