"use client";

import { FormEvent, useState } from "react";
import { AlertCircle, Check, Plus, X } from "lucide-react";

export function AddContentSource() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/sources", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await response.json() as { error?: string };
    if (!response.ok) {
      setState("error");
      setMessage(data.error || "The source could not be saved.");
      return;
    }
    setState("success");
    setMessage("Source saved. Refreshing the library…");
    window.setTimeout(() => window.location.reload(), 700);
  }

  if (!open) return <button type="button" className="primary-button" onClick={() => setOpen(true)}><Plus aria-hidden="true" size={17} /> Add content</button>;
  return (
    <div className="surface-card fixed inset-x-3 bottom-24 z-50 max-h-[calc(100dvh-120px)] overflow-y-auto p-5 shadow-[var(--shadow-lg)] sm:inset-auto sm:right-6 sm:top-24 sm:w-[430px] lg:right-8">
      <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-extrabold">Add a reusable source</h2><p className="mt-1 text-sm text-[var(--muted-ink)]">Save only the structured details you want to reuse.</p></div><button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Close add content form"><X aria-hidden="true" size={18} /></button></div>
      <form className="mt-5 grid gap-4" onSubmit={submit}>
        <label className="grid gap-1.5 text-sm font-bold">Type<select name="type" className="min-h-12 rounded-2xl border border-[var(--border)] bg-white px-4 font-normal"><option value="product">Product</option><option value="article">Article</option><option value="landing">Offer / landing page</option></select></label>
        <label className="grid gap-1.5 text-sm font-bold">Title<input required name="title" minLength={2} maxLength={300} className="min-h-12 rounded-2xl border border-[var(--border)] px-4 font-normal" /></label>
        <label className="grid gap-1.5 text-sm font-bold">Public source URL <span className="font-normal text-[var(--muted-ink)]">Optional</span><input name="sourceUrl" type="url" className="min-h-12 rounded-2xl border border-[var(--border)] px-4 font-normal" placeholder="https://" /></label>
        <label className="grid gap-1.5 text-sm font-bold">Summary<textarea required name="summary" minLength={2} maxLength={1800} rows={5} className="rounded-2xl border border-[var(--border)] px-4 py-3 font-normal" /></label>
        {state === "error" && <p role="alert" className="flex gap-2 rounded-xl bg-[#fff0ed] p-3 text-sm text-[#7b271d]"><AlertCircle aria-hidden="true" size={17} /> {message}</p>}
        {state === "success" && <p aria-live="polite" className="flex gap-2 rounded-xl bg-[var(--sage)] p-3 text-sm text-[#35502f]"><Check aria-hidden="true" size={17} /> {message}</p>}
        <button type="submit" className="primary-button" disabled={state === "loading"}>{state === "loading" ? "Saving…" : "Save source"}</button>
      </form>
    </div>
  );
}
