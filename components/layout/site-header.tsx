"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "@/components/layout/brand";

const links = [
  { href: "/pin-title-generator", label: "Tools" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-[color:var(--border)]/80 bg-[color:var(--canvas)]/92 backdrop-blur-xl">
      <div className="site-container flex min-h-[72px] items-center justify-between gap-4">
        <Brand />
        <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="ghost-button">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="ghost-button">Log in</Link>
          <Link href="/dashboard" className="primary-button">Open workspace</Link>
        </div>
        <button
          type="button"
          className="icon-button site-header-menu-button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
      </div>
      {open && (
        <nav aria-label="Mobile navigation" className="site-container border-t border-[var(--border)] py-3 md:hidden">
          <div className="grid gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="ghost-button justify-start" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="ghost-button justify-start" onClick={() => setOpen(false)}>Log in</Link>
            <Link href="/dashboard" className="primary-button mt-2" onClick={() => setOpen(false)}>Open workspace</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
