"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, History, LayoutDashboard, Library, LogOut, Rows3, Settings } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { authClient } from "@/lib/auth-client";

const items = [
  { href: "/dashboard", label: "Create", icon: LayoutDashboard },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/content", label: "Content library", icon: Library },
  { href: "/dashboard/batch", label: "Batch", icon: Rows3 },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[232px] border-r border-[var(--border)] bg-white px-4 py-5 lg:flex lg:flex-col">
        <div className="px-2"><Brand /></div>
        <nav aria-label="Workspace navigation" className="mt-8 grid gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`flex min-h-12 items-center gap-3 rounded-2xl px-3 text-sm font-bold transition-colors duration-200 ${active ? "bg-[var(--blush)] text-[var(--cherry-hover)]" : "text-[var(--muted-ink)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"}`}>
                <Icon aria-hidden="true" size={19} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto grid gap-1 border-t border-[var(--border)] pt-4">
          <Link href="/dashboard/settings" className="ghost-button justify-start"><Settings aria-hidden="true" size={18} /> Settings</Link>
          <button type="button" className="ghost-button justify-start" onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/"; } } })}>
            <LogOut aria-hidden="true" size={18} /> Sign out
          </button>
        </div>
      </aside>
      <nav aria-label="Mobile workspace navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[var(--border)] bg-white/96 px-[max(8px,env(safe-area-inset-left))] pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-lg lg:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold ${active ? "text-[var(--cherry)]" : "text-[var(--muted-ink)]"}`}>
              <Icon aria-hidden="true" size={19} /> {item.label === "Content library" ? "Library" : item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
