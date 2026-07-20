import { headers } from "next/headers";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { QuickStudio, type StudioSource } from "@/components/dashboard/quick-studio";
import { getSessionFromHeaders } from "@/lib/auth";
import { getAppEnv } from "@/lib/cloudflare";

const demoSources: StudioSource[] = [
  { id: "demo-product", type: "product", title: "Minimal meal planner printable", summary: "Undated weekly planning pages designed for busy households and simple meal prep routines." },
  { id: "demo-article", type: "article", title: "Small balcony herb garden guide", summary: "A beginner guide covering containers, light, watering, and useful culinary herbs." },
  { id: "demo-offer", type: "landing", title: "Autumn soy candle gift set", summary: "A small-batch set of warm seasonal scents presented as a ready-to-gift collection." },
];

async function loadSources() {
  const session = await getSessionFromHeaders(await headers());
  if (!session?.user) return { sources: demoSources, demo: true };
  const env = await getAppEnv();
  if (!env.DB) return { sources: [], demo: false };
  const result = await env.DB.prepare("SELECT id, type, title, summary FROM content_sources WHERE user_id = ? ORDER BY updated_at DESC LIMIT 12").bind(session.user.id).all<StudioSource>();
  return { sources: result.results, demo: false };
}

export default async function DashboardPage() {
  const { sources, demo } = await loadSources();
  return <div className="mx-auto max-w-[1500px]"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow"><Sparkles aria-hidden="true" size={14} /> Source-first studio</p><h1 className="display-font mt-3 text-3xl sm:text-4xl">Create from something you already have</h1></div><Link href="/dashboard/content" className="secondary-button"><Plus aria-hidden="true" size={17} /> Add content</Link></div><QuickStudio sources={sources} demo={demo} /></div>;
}
