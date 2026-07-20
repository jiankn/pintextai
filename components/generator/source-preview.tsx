"use client";

import Link from "next/link";
import { Check, CheckCircle2, FileText, Library, LoaderCircle, Package, PanelTop, X } from "lucide-react";
import { useState } from "react";
import type { SourceSnapshot } from "@/lib/source/schemas";

const icons = { manual: FileText, product: Package, article: FileText, landing: PanelTop };

type Props = {
  snapshot: SourceSnapshot;
  onChange: (value: SourceSnapshot) => void;
  onClear: () => void;
};

export function SourcePreview({ snapshot, onChange, onClear }: Props) {
  const Icon = icons[snapshot.type];
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "auth" | "error">("idle");
  const update = <K extends keyof SourceSnapshot>(key: K, value: SourceSnapshot[K]) => {
    setSaveState("idle");
    onChange({ ...snapshot, [key]: value });
  };

  async function save() {
    setSaveState("saving");
    try {
      const response = await fetch("/api/sources", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: snapshot.type === "manual" ? "landing" : snapshot.type, title: snapshot.title, summary: snapshot.summary, sourceUrl: snapshot.url || "", details: snapshot.details, keywords: snapshot.keywords }) });
      if (response.status === 401) { setSaveState("auth"); return; }
      if (!response.ok) throw new Error("Save failed");
      setSaveState("saved");
    } catch { setSaveState("error"); }
  }

  return (
    <section aria-labelledby="source-preview-title" className="mt-5 rounded-[20px] border border-[color:var(--cherry)]/25 bg-[var(--blush)]/55 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-[var(--cherry)] shadow-sm">
            <Icon aria-hidden="true" size={19} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 id="source-preview-title" className="font-extrabold">Source preview</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-bold capitalize text-[var(--muted-ink)]">
                <CheckCircle2 aria-hidden="true" size={13} /> {snapshot.type}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--muted-ink)]">Review and edit what the AI is allowed to use.</p>
          </div>
        </div>
        <button type="button" onClick={onClear} className="icon-button shrink-0" aria-label="Remove source preview">
          <X aria-hidden="true" size={18} />
        </button>
      </div>

      <div className="mt-4 grid gap-4">
        <label className="grid gap-1.5 text-sm font-bold">
          Source title
          <input
            value={snapshot.title}
            maxLength={300}
            onChange={(event) => update("title", event.target.value)}
            className="min-h-12 rounded-2xl border border-[var(--border)] bg-white px-4 font-normal outline-none transition-shadow focus:border-[var(--cherry)] focus:ring-4 focus:ring-[color:var(--blush)]"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-bold">
          Summary and usable details
          <textarea
            value={snapshot.summary}
            maxLength={1800}
            rows={4}
            onChange={(event) => update("summary", event.target.value)}
            className="resize-y rounded-2xl border border-[var(--border)] bg-white px-4 py-3 font-normal outline-none transition-shadow focus:border-[var(--cherry)] focus:ring-4 focus:ring-[color:var(--blush)]"
          />
        </label>
        {snapshot.details.length > 0 && (
          <div>
            <p className="text-sm font-extrabold">Key details</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {snapshot.details.map((detail, index) => (
                <input
                  key={`${index}-${detail.slice(0, 12)}`}
                  value={detail}
                  aria-label={`Key detail ${index + 1}`}
                  maxLength={300}
                  onChange={(event) => {
                    const next = [...snapshot.details];
                    next[index] = event.target.value;
                    update("details", next);
                  }}
                  className="min-h-11 rounded-2xl border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--cherry)]"
                />
              ))}
            </div>
          </div>
        )}
        {snapshot.keywords.length > 0 && (
          <div>
            <p className="text-sm font-extrabold">Suggested from your content</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {snapshot.keywords.map((keyword) => (
                <span key={keyword} className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-bold text-[var(--muted-ink)]">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--cherry)]/15 pt-4"><p className="text-xs text-[var(--muted-ink)]">Save this edited snapshot to reuse it for other output types.</p><button type="button" className="secondary-button" onClick={save} disabled={saveState === "saving" || saveState === "saved"}>{saveState === "saving" ? <LoaderCircle aria-hidden="true" className="spinner" size={16} /> : saveState === "saved" ? <Check aria-hidden="true" size={16} /> : <Library aria-hidden="true" size={16} />}{saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save to library"}</button></div>
        {saveState === "auth" && <p className="rounded-xl bg-white p-3 text-sm text-[var(--muted-ink)]"><Link href="/login" className="font-extrabold text-[var(--cherry-hover)] underline underline-offset-4">Sign in with Google</Link> to save this source.</p>}
        {saveState === "error" && <p role="alert" className="text-sm text-[var(--danger)]">The source could not be saved. Try again.</p>}
      </div>
    </section>
  );
}
