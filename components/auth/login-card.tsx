"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function LoginCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login() {
    setLoading(true);
    setError(null);
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
      errorCallbackURL: "/login?error=oauth",
    });
    if (result?.error) {
      setError(result.error.message || "Google sign-in is not configured yet.");
      setLoading(false);
    }
  }

  return (
    <div className="surface-card w-full max-w-md p-6 shadow-[var(--shadow-lg)] sm:p-8">
      <h1 className="display-font text-3xl">Welcome to your workspace</h1>
      <p className="mt-3 text-sm text-[var(--muted-ink)]">Sign in to save sources, keep generation history, and use your daily credits across devices.</p>
      <button type="button" className="primary-button mt-7 w-full" onClick={login} disabled={loading}>
        {loading && <LoaderCircle aria-hidden="true" className="spinner" size={18} />}
        {loading ? "Connecting to Google…" : "Continue with Google"}
      </button>
      {error && <p role="alert" className="mt-4 flex gap-2 rounded-2xl bg-[#fff0ed] p-3 text-sm text-[#7b271d]"><AlertCircle aria-hidden="true" className="mt-0.5 shrink-0" size={17} />{error}</p>}
      <div className="my-6 flex items-center gap-3 text-xs text-[var(--muted-ink)]"><span className="h-px flex-1 bg-[var(--border)]" />or<span className="h-px flex-1 bg-[var(--border)]" /></div>
      <Link href="/dashboard" className="secondary-button w-full">Explore the demo workspace <ArrowRight aria-hidden="true" size={17} /></Link>
      <p className="mt-6 text-center text-xs leading-5 text-[var(--muted-ink)]">By continuing, you agree to the <Link className="underline underline-offset-3" href="/terms">Terms</Link> and acknowledge the <Link className="underline underline-offset-3" href="/privacy">Privacy Policy</Link>.</p>
    </div>
  );
}
