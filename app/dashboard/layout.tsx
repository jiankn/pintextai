import Link from "next/link";
import { headers } from "next/headers";
import { ArrowUpRight, Zap } from "lucide-react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Brand } from "@/components/layout/brand";
import { getSessionFromHeaders } from "@/lib/auth";
import { getAppEnv } from "@/lib/cloudflare";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getSessionFromHeaders(await headers());
  let plan = "free";
  let creditLabel = "Demo mode";
  if (session?.user) {
    const env = await getAppEnv();
    const account = env.DB ? await env.DB.prepare("SELECT plan FROM user WHERE id = ? LIMIT 1").bind(session.user.id).first<{ plan: string }>() : null;
    plan = account?.plan || "free";
    const monthly = plan !== "free";
    const period = new Date().toISOString().slice(0, monthly ? 7 : 10);
    const usage = env.DB ? await env.DB.prepare(monthly ? "SELECT used, limit_value FROM usage_monthly WHERE user_id = ? AND period = ?" : "SELECT used, limit_value FROM usage_daily WHERE subject_id = ? AND usage_date = ?").bind(session.user.id, period).first<{ used: number; limit_value: number }>() : null;
    const limit = usage?.limit_value || (plan === "business" ? 4000 : plan === "pro" ? 1000 : 5);
    creditLabel = `${Math.max(0, limit - (usage?.used || 0)).toLocaleString()} credits left`;
  }
  return (
    <div className="min-h-dvh bg-[var(--canvas)] pb-24 lg:pb-0 lg:pl-[232px]">
      <DashboardNav />
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[color:var(--canvas)]/92 backdrop-blur-xl">
        <div className="flex min-h-[72px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="lg:hidden"><Brand /></div>
          <div className="hidden lg:block">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted-ink)]">Workspace</p>
            <p className="text-sm font-extrabold">{session?.user.name || "Demo workspace"}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden min-h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 text-sm font-bold sm:inline-flex">
              <Zap aria-hidden="true" size={16} className="text-[var(--cherry)]" /> {creditLabel}
            </span>
            {plan === "free" && <Link href="/pricing" className="primary-button min-h-11 px-4 text-sm">Upgrade <ArrowUpRight aria-hidden="true" size={16} /></Link>}
          </div>
        </div>
      </header>
      {!session && (
        <div className="border-b border-[color:var(--cherry)]/15 bg-[var(--blush)] px-4 py-2.5 text-center text-sm text-[var(--muted-ink)]">
          You are viewing a non-persistent demo workspace. <Link href="/login" className="font-extrabold text-[var(--cherry-hover)] underline underline-offset-4">Sign in with Google</Link> to save sources and history.
        </div>
      )}
      <main id="main-content" className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
