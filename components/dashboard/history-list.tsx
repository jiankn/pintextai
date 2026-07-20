"use client";

import Link from "next/link";
import { ArrowRight, Copy, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export type HistoryItem = { id: string; type: string; topic: string; vibe: string; result: string; createdAt: number };
const paths: Record<string, string> = { title: "/pin-title-generator", description: "/pin-description-generator", caption: "/pin-caption-generator", hashtag: "/pinterest-hashtag-generator" };

export function HistoryList({ initial, demo }: { initial: HistoryItem[]; demo: boolean }) {
  const [items, setItems] = useState(initial);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const filtered = useMemo(() => items.filter((item) => (type === "all" || item.type === type) && `${item.topic} ${item.result}`.toLowerCase().includes(query.toLowerCase())), [items, query, type]);
  async function remove(id: string) {
    if (demo) { setItems((current) => current.filter((item) => item.id !== id)); return; }
    const response = await fetch(`/api/history?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) setItems((current) => current.filter((item) => item.id !== id));
  }
  return <div className="surface-card mt-7 overflow-hidden"><div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] p-4"><label className="relative min-w-60 flex-1"><span className="sr-only">Search history</span><Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-ink)]" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by source or result" className="min-h-11 w-full rounded-full border border-[var(--border)] bg-white pl-10 pr-4 text-sm" /></label><select aria-label="Filter by output type" value={type} onChange={(event) => setType(event.target.value)} className="min-h-11 rounded-full border border-[var(--border)] bg-white px-4 text-sm font-bold"><option value="all">All output types</option><option value="title">Titles</option><option value="description">Descriptions</option><option value="caption">Captions</option><option value="hashtag">Hashtags</option></select></div>
  {filtered.length === 0 ? <div className="p-12 text-center"><h2 className="font-extrabold">{items.length ? "No matching generations" : "No saved generations yet"}</h2><p className="mt-2 text-sm text-[var(--muted-ink)]">{items.length ? "Try a broader search or another output type." : "Your completed, signed-in generations will appear here."}</p></div> : <div className="divide-y divide-[var(--border)]">{filtered.map((item) => <article key={item.id} className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[190px_minmax(0,1fr)_auto] lg:items-center"><div><span className="rounded-full bg-[var(--blush)] px-2.5 py-1 text-xs font-extrabold capitalize text-[var(--cherry-hover)]">{item.type}</span><p className="mt-2 text-sm font-extrabold">{item.topic}</p><p className="text-xs text-[var(--muted-ink)]">{new Date(item.createdAt * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {item.vibe}</p></div><p className="rounded-2xl bg-[var(--canvas)] p-4 text-sm font-semibold leading-6">{item.result}</p><div className="flex gap-1"><button type="button" className="icon-button" aria-label="Copy first result" onClick={() => navigator.clipboard.writeText(item.result)}><Copy aria-hidden="true" size={17} /></button><Link href={`${paths[item.type] || paths.title}?from=${encodeURIComponent(item.id)}`} className="icon-button" aria-label="Create another angle"><ArrowRight aria-hidden="true" size={17} /></Link><button type="button" className="icon-button text-[var(--danger)]" aria-label="Delete generation" onClick={() => remove(item.id)}><Trash2 aria-hidden="true" size={17} /></button></div></article>)}</div>}</div>;
}
