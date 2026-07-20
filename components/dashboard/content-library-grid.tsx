"use client";

import Link from "next/link";
import { ArrowRight, FileText, Package, PanelTop, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export type SourceCard = { id: string; type: string; title: string; summary: string; source_url: string | null; updated_at: number };
const iconMap = { product: Package, article: FileText, landing: PanelTop } as const;
const colorMap = { product: "var(--blush)", article: "var(--sage)", landing: "var(--peach)" } as const;

export function ContentLibraryGrid({ initial, demo }: { initial: SourceCard[]; demo: boolean }) {
  const [items, setItems] = useState(initial);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const filtered = useMemo(() => items.filter((item) => (type === "all" || item.type === type) && `${item.title} ${item.summary}`.toLowerCase().includes(query.toLowerCase())), [items, query, type]);
  async function remove(id: string) {
    if (!window.confirm("Delete this saved source? Existing generation history will remain.")) return;
    if (demo) { setItems((current) => current.filter((item) => item.id !== id)); return; }
    const response = await fetch(`/api/sources?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) setItems((current) => current.filter((item) => item.id !== id));
  }
  return <><div className="mt-7 flex flex-wrap gap-3"><label className="relative min-w-64 flex-1"><span className="sr-only">Search content</span><Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-ink)]" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search saved content" className="min-h-11 w-full rounded-full border border-[var(--border)] bg-white pl-10 pr-4 text-sm" /></label><select aria-label="Filter saved content by type" value={type} onChange={(event) => setType(event.target.value)} className="secondary-button"><option value="all">All types</option><option value="product">Products</option><option value="article">Articles</option><option value="landing">Offers</option></select></div>
  {filtered.length === 0 ? <div className="surface-card mt-5 p-12 text-center"><h2 className="font-extrabold">{items.length ? "No matching sources" : "No saved content yet"}</h2><p className="mt-2 text-sm text-[var(--muted-ink)]">{items.length ? "Try another search or source type." : "Add a product, article, or offer you promote repeatedly."}</p></div> : <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((source) => { const Icon = iconMap[source.type as keyof typeof iconMap] || FileText; const color = colorMap[source.type as keyof typeof colorMap] || "var(--lavender)"; return <article key={source.id} className="surface-card flex min-h-[270px] flex-col p-5 transition-[border-color,box-shadow] hover:border-[color:var(--cherry)]/25 hover:shadow-[var(--shadow-md)]"><div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-[17px]" style={{ background: color }}><Icon aria-hidden="true" size={20} /></span><div className="flex items-center gap-2"><span className="rounded-full bg-[var(--canvas)] px-2.5 py-1 text-xs font-bold capitalize text-[var(--muted-ink)]">{source.type}</span><button type="button" className="icon-button size-10 min-h-10 text-[var(--danger)]" aria-label={`Delete ${source.title}`} onClick={() => remove(source.id)}><Trash2 aria-hidden="true" size={16} /></button></div></div><h2 className="mt-5 text-lg font-extrabold leading-6">{source.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted-ink)]">{source.summary}</p><div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--border)] pt-4"><span className="text-xs text-[var(--muted-ink)]">Updated {new Date(source.updated_at * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span><Link href={`/pin-title-generator?source=${encodeURIComponent(source.id)}`} className="ghost-button min-h-11 px-3 text-sm text-[var(--cherry)]">Create <ArrowRight aria-hidden="true" size={16} /></Link></div></article>; })}</div>}</>;
}
