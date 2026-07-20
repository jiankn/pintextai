"use client";

import Link from "next/link";
import { AlertCircle, Check, Copy, FileText, Hash, LoaderCircle, MessageSquareText, Package, PanelTop, Plus, Sparkles, TextCursorInput } from "lucide-react";
import { useMemo, useState } from "react";
import { TurnstileWidget } from "@/components/generator/turnstile-widget";
import type { GeneratedItem } from "@/lib/ai/schemas";
import { ARTICLE_ANGLES, GOALS, PRODUCT_ANGLES, type GeneratorType, type Goal, VIBES, type Vibe } from "@/lib/product";

export type StudioSource = { id: string; title: string; summary: string; type: "product" | "article" | "landing" };
const outputTypes = [
  { type: "title" as const, icon: TextCursorInput, label: "Titles" },
  { type: "description" as const, icon: FileText, label: "Descriptions" },
  { type: "caption" as const, icon: MessageSquareText, label: "Captions" },
  { type: "hashtag" as const, icon: Hash, label: "Hashtags" },
];
const sourceIcons = { product: Package, article: FileText, landing: PanelTop };
const sourceColors = { product: "var(--blush)", article: "var(--sage)", landing: "var(--peach)" };

export function QuickStudio({ sources, demo }: { sources: StudioSource[]; demo: boolean }) {
  const [selectedId, setSelectedId] = useState(sources[0]?.id || "");
  const [outputType, setOutputType] = useState<GeneratorType>("title");
  const [goal, setGoal] = useState<Goal>("Drive sales");
  const [angle, setAngle] = useState("Benefit");
  const [keyword, setKeyword] = useState("");
  const [vibe, setVibe] = useState<Vibe>("Natural");
  const [items, setItems] = useState<GeneratedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const selected = useMemo(() => sources.find((source) => source.id === selectedId) || sources[0], [selectedId, sources]);
  const angles = selected?.type === "article" ? ARTICLE_ANGLES : PRODUCT_ANGLES;

  async function generate() {
    if (!selected) { setError("Add a reusable source before generating in the workspace."); return; }
    setLoading(true); setError(null);
    try {
      const response = await fetch(`/api/generate/${outputType}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ requestId: crypto.randomUUID(), type: outputType, sourceId: demo ? undefined : selected.id, topic: demo ? `${selected.title}\n${selected.summary}` : undefined, goal, vibe, angle, keyword: keyword || undefined, cta: "Auto", turnstileToken }) });
      const data = await response.json() as { items?: GeneratedItem[]; error?: string };
      if (!response.ok || !data.items) throw new Error(data.error || "Generation failed.");
      setItems(data.items); setTurnstileToken(""); setTurnstileReset((value) => value + 1);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Generation failed."); }
    finally { setLoading(false); }
  }

  async function copy(index: number) { await navigator.clipboard.writeText(items[index].text); setCopied(index); window.setTimeout(() => setCopied(null), 1200); }

  return <div className="grid gap-5 xl:grid-cols-[310px_minmax(0,1fr)]"><aside className="surface-card h-fit p-4 xl:sticky xl:top-24"><div className="flex items-center justify-between px-1"><h2 className="font-extrabold">Recent sources</h2><Link href="/dashboard/content" className="ghost-button min-h-11 px-2 text-xs">View all</Link></div><div className="mt-3 grid gap-2">{sources.length ? sources.map((source) => { const Icon = sourceIcons[source.type]; return <button key={source.id} type="button" onClick={() => { setSelectedId(source.id); setGoal(source.type === "article" ? "Get clicks" : "Drive sales"); setAngle(source.type === "article" ? "How-to" : "Benefit"); setItems([]); }} className={`flex min-h-[76px] w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${selected?.id === source.id ? "border-[color:var(--cherry)]/25 bg-[var(--blush)]/50" : "border-transparent hover:bg-[var(--canvas)]"}`}><span className="grid size-10 shrink-0 place-items-center rounded-2xl" style={{ background: sourceColors[source.type] }}><Icon aria-hidden="true" size={18} /></span><span className="min-w-0"><span className="block truncate text-sm font-extrabold">{source.title}</span><span className="block truncate text-xs capitalize text-[var(--muted-ink)]">{source.type}</span></span></button>; }) : <p className="rounded-2xl bg-[var(--canvas)] p-4 text-sm text-[var(--muted-ink)]">No saved sources yet.</p>}</div><Link href="/dashboard/content" className="secondary-button mt-3 w-full"><Plus aria-hidden="true" size={17} /> New source</Link></aside>
  <section className="surface-card overflow-hidden"><div className="border-b border-[var(--border)] p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-wider text-[var(--muted-ink)]">{selected ? `Selected ${selected.type}` : "No source selected"}</p><h2 className="mt-1 text-xl font-extrabold">{selected?.title || "Add a source to start"}</h2>{selected && <p className="mt-2 line-clamp-2 text-sm text-[var(--muted-ink)]">{selected.summary}</p>}<div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{outputTypes.map((item) => { const Icon = item.icon; return <button key={item.type} type="button" onClick={() => { setOutputType(item.type); setItems([]); }} aria-pressed={outputType === item.type} className={`flex min-h-12 items-center justify-center gap-2 rounded-full border px-3 text-sm font-bold ${outputType === item.type ? "border-[var(--cherry)] bg-[var(--blush)] text-[var(--cherry-hover)]" : "border-[var(--border)] bg-white hover:bg-[var(--canvas)]"}`}><Icon aria-hidden="true" size={17} />{item.label}</button>; })}</div></div>
  <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]"><div className="border-b border-[var(--border)] bg-[var(--canvas)]/55 p-5 lg:border-b-0 lg:border-r"><h3 className="text-sm font-extrabold">Generation setup</h3><div className="mt-4 grid gap-4"><label className="grid gap-1.5 text-xs font-bold">Goal<select value={goal} onChange={(event) => setGoal(event.target.value as Goal)} className="min-h-11 rounded-2xl border border-[var(--border)] bg-white px-3 text-sm font-normal">{GOALS.map((item) => <option key={item}>{item}</option>)}</select></label><label className="grid gap-1.5 text-xs font-bold">Angle<select value={angle} onChange={(event) => setAngle(event.target.value)} className="min-h-11 rounded-2xl border border-[var(--border)] bg-white px-3 text-sm font-normal">{angles.map((item) => <option key={item}>{item}</option>)}</select></label><label className="grid gap-1.5 text-xs font-bold">Target keyword<input value={keyword} onChange={(event) => setKeyword(event.target.value)} maxLength={120} placeholder="Optional" className="min-h-11 rounded-2xl border border-[var(--border)] bg-white px-3 text-sm font-normal" /></label><label className="grid gap-1.5 text-xs font-bold">Vibe<select value={vibe} onChange={(event) => setVibe(event.target.value as Vibe)} className="min-h-11 rounded-2xl border border-[var(--border)] bg-white px-3 text-sm font-normal">{VIBES.map((item) => <option key={item}>{item}</option>)}</select></label></div>{demo && <TurnstileWidget onToken={setTurnstileToken} resetKey={turnstileReset} />}{error && <p role="alert" className="mt-4 flex gap-2 rounded-xl bg-[#fff0ed] p-3 text-xs text-[#7b271d]"><AlertCircle aria-hidden="true" className="shrink-0" size={15} />{error}</p>}<button type="button" className="primary-button mt-5 w-full" onClick={generate} disabled={loading || !selected}>{loading ? <LoaderCircle aria-hidden="true" className="spinner" size={17} /> : <Sparkles aria-hidden="true" size={17} />}{loading ? "Generating…" : "Generate 10"}</button></div>
  <div className="p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><h3 className="font-extrabold">{items.length ? "Editable results" : "Ready for a new set"}</h3><span className="text-xs text-[var(--muted-ink)]">{demo ? "Demo data is not saved" : "Completed sets auto-save"}</span></div>{items.length ? <div className="mt-4 grid gap-3">{items.map((item, index) => <div key={`${index}-${item.angle}`} className="rounded-2xl border border-[var(--border)] bg-white p-3"><div className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--blush)] text-xs font-bold text-[var(--cherry)]">{index + 1}</span><textarea aria-label={`Result ${index + 1}`} value={item.text} rows={outputType === "title" ? 2 : 3} onChange={(event) => setItems((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, text: event.target.value } : entry))} className="min-w-0 flex-1 resize-y bg-transparent text-sm font-semibold leading-6 outline-none" /><button type="button" className="icon-button size-10 min-h-10 shrink-0" aria-label={`Copy result ${index + 1}`} onClick={() => copy(index)}>{copied === index ? <Check aria-hidden="true" size={16} className="text-[#35502f]" /> : <Copy aria-hidden="true" size={16} />}</button></div></div>)}</div> : <div className="grid min-h-[360px] place-items-center text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-[20px] bg-[var(--lavender)]"><Sparkles aria-hidden="true" size={23} /></span><p className="mt-4 font-extrabold">Choose a source and settings</p><p className="mt-2 max-w-sm text-sm text-[var(--muted-ink)]">The next set of 10 editable {outputTypes.find((item) => item.type === outputType)?.label.toLowerCase()} will appear here.</p></div></div>}</div></div></section></div>;
}
