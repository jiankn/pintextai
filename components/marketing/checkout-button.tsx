"use client";

import { LoaderCircle } from "lucide-react";
import { useState } from "react";

export function CheckoutButton({ interval, children }: { interval: "month" | "year"; children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (response.status === 401) {
        window.location.href = "/login?next=/pricing";
        return;
      }
      if (!response.ok || !data.url) throw new Error(data.error || "Checkout could not be started.");
      window.location.href = data.url;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Checkout could not be started.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" className="primary-button w-full" onClick={checkout} disabled={loading}>
        {loading && <LoaderCircle aria-hidden="true" className="spinner" size={17} />}
        {loading ? "Opening secure checkout…" : children}
      </button>
      {error && <p role="alert" className="mt-2 text-center text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
