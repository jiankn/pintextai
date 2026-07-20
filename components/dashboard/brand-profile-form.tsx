"use client";

import { FormEvent, useState } from "react";
import { AlertCircle, Check, LoaderCircle, Trash2 } from "lucide-react";

export type BrandProfileValue = { id?: string; name: string; audience: string; voice: string; defaultCta: string; bannedTerms: string; keywords: string };

export function BrandProfileForm({ initial }: { initial?: BrandProfileValue }) {
  const [value, setValue] = useState<BrandProfileValue>(initial || { name: "", audience: "", voice: "", defaultCta: "", bannedTerms: "", keywords: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  function field(name: keyof BrandProfileValue, next: string) { setValue((current) => ({ ...current, [name]: next })); setStatus("idle"); }
  async function save(event: FormEvent) {
    event.preventDefault(); setStatus("saving"); setMessage("");
    const response = await fetch("/api/brand-profiles", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...value, bannedTerms: value.bannedTerms.split(",").map((item) => item.trim()).filter(Boolean), keywords: value.keywords.split(",").map((item) => item.trim()).filter(Boolean) }) });
    const data = await response.json() as { id?: string; error?: string };
    if (!response.ok) { setStatus("error"); setMessage(data.error || "The profile could not be saved."); return; }
    setValue((current) => ({ ...current, id: data.id || current.id })); setStatus("saved"); setMessage("Brand defaults saved.");
  }
  async function remove() {
    if (!value.id || !window.confirm("Delete this brand profile?")) return;
    const response = await fetch(`/api/brand-profiles?id=${encodeURIComponent(value.id)}`, { method: "DELETE" });
    if (response.ok) window.location.reload(); else { const data = await response.json() as { error?: string }; setStatus("error"); setMessage(data.error || "The profile could not be deleted."); }
  }
  return <form onSubmit={save} className="surface-card p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-extrabold">{value.id ? value.name : "New brand profile"}</h2><p className="mt-1 text-sm text-[var(--muted-ink)]">Used as defaults; you can still override every generation.</p></div>{value.id && <button type="button" className="icon-button text-[var(--danger)]" aria-label={`Delete ${value.name}`} onClick={remove}><Trash2 aria-hidden="true" size={17} /></button>}</div>
    <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-bold">Profile name<input required minLength={2} maxLength={80} value={value.name} onChange={(event) => field("name", event.target.value)} className="min-h-12 rounded-2xl border border-[var(--border)] px-4 font-normal" placeholder="e.g. Northlight Studio" /></label><label className="grid gap-1.5 text-sm font-bold">Default CTA<input maxLength={120} value={value.defaultCta} onChange={(event) => field("defaultCta", event.target.value)} className="min-h-12 rounded-2xl border border-[var(--border)] px-4 font-normal" placeholder="e.g. Explore the collection" /></label><label className="grid gap-1.5 text-sm font-bold sm:col-span-2">Audience<textarea rows={3} maxLength={300} value={value.audience} onChange={(event) => field("audience", event.target.value)} className="rounded-2xl border border-[var(--border)] px-4 py-3 font-normal" placeholder="Who the brand serves and what they care about" /></label><label className="grid gap-1.5 text-sm font-bold sm:col-span-2">Voice<textarea rows={3} maxLength={300} value={value.voice} onChange={(event) => field("voice", event.target.value)} className="rounded-2xl border border-[var(--border)] px-4 py-3 font-normal" placeholder="e.g. Warm, concise, practical; never pushy" /></label><label className="grid gap-1.5 text-sm font-bold">Preferred keywords<input value={value.keywords} onChange={(event) => field("keywords", event.target.value)} className="min-h-12 rounded-2xl border border-[var(--border)] px-4 font-normal" placeholder="Comma separated" /></label><label className="grid gap-1.5 text-sm font-bold">Banned terms<input value={value.bannedTerms} onChange={(event) => field("bannedTerms", event.target.value)} className="min-h-12 rounded-2xl border border-[var(--border)] px-4 font-normal" placeholder="Comma separated" /></label></div>
    {status === "error" && <p role="alert" className="mt-4 flex gap-2 rounded-2xl bg-[#fff0ed] p-3 text-sm text-[#7b271d]"><AlertCircle aria-hidden="true" size={17} />{message}</p>}{status === "saved" && <p aria-live="polite" className="mt-4 flex gap-2 rounded-2xl bg-[var(--sage)] p-3 text-sm text-[#35502f]"><Check aria-hidden="true" size={17} />{message}</p>}
    <button type="submit" className="primary-button mt-5" disabled={status === "saving"}>{status === "saving" && <LoaderCircle aria-hidden="true" className="spinner" size={17} />}{status === "saving" ? "Saving…" : "Save brand profile"}</button></form>;
}
