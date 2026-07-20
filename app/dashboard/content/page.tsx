import { headers } from "next/headers";
import { AddContentSource } from "@/components/dashboard/content-library-client";
import { ContentLibraryGrid } from "@/components/dashboard/content-library-grid";
import { getSessionFromHeaders } from "@/lib/auth";
import { getAppEnv } from "@/lib/cloudflare";

type SourceRow = { id: string; type: string; title: string; summary: string; source_url: string | null; updated_at: number };
const demo: SourceRow[] = [
  { id: "demo-product", type: "product", title: "Minimal weekly meal planner printable", summary: "Undated weekly planning pages designed for busy households and simple meal prep routines.", source_url: "https://example.com/meal-planner", updated_at: Math.floor(Date.now() / 1000) - 480 },
  { id: "demo-article", type: "article", title: "How to grow herbs on a small balcony", summary: "A beginner guide covering containers, light, watering, and six useful culinary herbs.", source_url: "https://example.com/balcony-herbs", updated_at: Math.floor(Date.now() / 1000) - 86400 },
  { id: "demo-offer", type: "landing", title: "Autumn soy candle gift set", summary: "A small-batch set of warm seasonal scents presented as a ready-to-gift collection.", source_url: null, updated_at: Math.floor(Date.now() / 1000) - 259200 },
];

async function sources() {
  const session = await getSessionFromHeaders(await headers());
  if (!session?.user) return { rows: demo, demo: true };
  const env = await getAppEnv();
  if (!env.DB) return { rows: [], demo: false };
  const result = await env.DB.prepare("SELECT id, type, title, summary, source_url, updated_at FROM content_sources WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100").bind(session.user.id).all<SourceRow>();
  return { rows: result.results, demo: false };
}

export default async function ContentPage() {
  const { rows, demo: isDemo } = await sources();
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Reusable content</p><h1 className="display-font mt-3 text-3xl sm:text-4xl">Content library</h1><p className="mt-2 text-sm text-[var(--muted-ink)]">Products, articles, and offers you promote more than once.</p></div><AddContentSource /></div>
      <ContentLibraryGrid initial={rows} demo={isDemo} />
      {isDemo && <p className="mt-5 text-center text-xs text-[var(--muted-ink)]">Demo sources are illustrative and are not persisted.</p>}
    </div>
  );
}
