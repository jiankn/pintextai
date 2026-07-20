"use client";

import { ExternalLink, LoaderCircle } from "lucide-react";
import { useState } from "react";

export function PortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function openPortal() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/billing/portal", { method: "POST" });
    const data = (await response.json()) as { url?: string; error?: string };
    if (response.ok && data.url) window.location.href = data.url;
    else { setError(data.error || "The portal could not be opened."); setLoading(false); }
  }
  return <div><button type="button" className="secondary-button mt-6 w-full" onClick={openPortal} disabled={loading}>{loading ? <LoaderCircle aria-hidden="true" className="spinner" size={16} /> : <ExternalLink aria-hidden="true" size={16} />}{loading ? "Opening portal…" : "Open Customer Portal"}</button>{error && <p role="alert" className="mt-3 text-xs text-[var(--danger)]">{error}</p>}</div>;
}
