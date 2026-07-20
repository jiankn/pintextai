"use client";

import Link from "next/link";
import { Check, Copy, Download, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import type { GeneratedItem } from "@/lib/ai/schemas";

type Props = {
  items: GeneratedItem[];
  generationId?: string;
  onChange: (items: GeneratedItem[]) => void;
  onRegenerate: (index: number) => Promise<void>;
};

export function ResultList({ items, generationId, onChange, onRegenerate }: Props) {
  const [copied, setCopied] = useState<number | "all" | null>(null);
  const [regenerating, setRegenerating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Record<number, 1 | -1>>({});

  async function copy(text: string, marker: number | "all") {
    await navigator.clipboard.writeText(text);
    setCopied(marker);
    window.setTimeout(() => setCopied(null), 1800);
  }

  async function regenerate(index: number) {
    setRegenerating(index);
    try {
      await onRegenerate(index);
    } finally {
      setRegenerating(null);
    }
  }

  async function rate(index: number, rating: 1 | -1) {
    setFeedback((current) => ({ ...current, [index]: rating }));
    if (!generationId) return;
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ generationId, rating, reason: `result:${index + 1}` }),
    }).catch(() => undefined);
  }

  return (
    <section id="results" aria-labelledby="results-heading" className="mx-auto mt-10 w-full max-w-[920px] scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow"><Check aria-hidden="true" size={14} /> 10 ready to edit</span>
          <h2 id="results-heading" className="display-font mt-3 text-3xl sm:text-4xl">Your Pin copy</h2>
          <p className="mt-1 text-sm text-[var(--muted-ink)]">Edit any line before you copy it. Your changes stay in this browser view.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="secondary-button" onClick={() => copy(items.map((item) => item.text).join("\n\n"), "all")}>
            {copied === "all" ? <Check aria-hidden="true" size={17} /> : <Copy aria-hidden="true" size={17} />}
            {copied === "all" ? "Copied all" : "Copy all 10"}
          </button>
          <Link href="/pricing" className="secondary-button" title="CSV export is included with Pro">
            <Download aria-hidden="true" size={17} /> Export CSV · Pro
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {items.map((item, index) => (
          <article key={index} className="surface-card group p-4 transition-[border-color,box-shadow] duration-200 hover:border-[color:var(--cherry)]/25 hover:shadow-[var(--shadow-md)] sm:p-5">
            <div className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--blush)] text-xs font-extrabold tabular-nums text-[var(--cherry-hover)]">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <textarea
                  aria-label={`Generated result ${index + 1}`}
                  value={item.text}
                  rows={Math.max(2, Math.ceil(item.text.length / 72))}
                  onChange={(event) => {
                    const next = [...items];
                    next[index] = { ...item, text: event.target.value };
                    onChange(next);
                  }}
                  className="block w-full resize-y border-0 bg-transparent p-0 text-[16px] font-semibold leading-7 text-[var(--ink)] outline-none"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-ink)]">
                    <span className="tabular-nums">{item.text.length} characters</span>
                    {item.angle && <span className="rounded-full bg-[var(--canvas)] px-2 py-0.5">{item.angle}</span>}
                    {item.keyword && <span className="rounded-full bg-[var(--sage)] px-2 py-0.5">{item.keyword}</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <button type="button" className={`ghost-button min-h-11 px-3 text-sm ${feedback[index] === 1 ? "bg-[var(--sage)] text-[#35502f]" : ""}`} aria-pressed={feedback[index] === 1} aria-label={`Mark result ${index + 1} helpful`} onClick={() => rate(index, 1)}>
                      <ThumbsUp aria-hidden="true" size={16} /> <span className="sr-only sm:not-sr-only">Useful</span>
                    </button>
                    <button type="button" className={`ghost-button min-h-11 px-3 text-sm ${feedback[index] === -1 ? "bg-[#fff0ed] text-[#7b271d]" : ""}`} aria-pressed={feedback[index] === -1} aria-label={`Mark result ${index + 1} not helpful`} onClick={() => rate(index, -1)}>
                      <ThumbsDown aria-hidden="true" size={16} /> <span className="sr-only">Not useful</span>
                    </button>
                    <button type="button" className="ghost-button min-h-11 px-3 text-sm" onClick={() => regenerate(index)} disabled={regenerating !== null}>
                      <RefreshCw aria-hidden="true" size={16} className={regenerating === index ? "spinner" : ""} /> Regenerate
                    </button>
                    <button type="button" className="secondary-button min-h-11 px-4 text-sm" onClick={() => copy(item.text, index)}>
                      {copied === index ? <Check aria-hidden="true" size={16} /> : <Copy aria-hidden="true" size={16} />}
                      {copied === index ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div aria-live="polite" className="sr-only">{copied === null ? "" : copied === "all" ? "All results copied" : `Result ${copied + 1} copied`}</div>

      <aside className="mt-5 flex flex-col justify-between gap-5 rounded-[20px] border border-[color:var(--cherry)]/20 bg-[var(--blush)] p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <h3 className="font-extrabold">Create for a full content calendar—not one Pin at a time.</h3>
          <p className="mt-1 text-sm text-[var(--muted-ink)]">Pro includes 1,000 monthly credits, 50-row batches, CSV export, and 12-month history.</p>
        </div>
        <Link href="/pricing" className="primary-button shrink-0">Explore Pro</Link>
      </aside>
    </section>
  );
}
