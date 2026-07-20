import { headers } from "next/headers";
import Link from "next/link";
import { Clock3, Sparkles } from "lucide-react";
import { HistoryList, type HistoryItem } from "@/components/dashboard/history-list";
import { getSessionFromHeaders } from "@/lib/auth";
import { getAppEnv } from "@/lib/cloudflare";

type HistoryRow = {
  id: string;
  type: string;
  input_json: string;
  output_json: string | null;
  created_at: number;
};

const demoRows: HistoryRow[] = [
  { id: "demo-1", type: "title", input_json: JSON.stringify({ topic: "Minimal weekly meal planner printable", vibe: "Natural" }), output_json: JSON.stringify({ items: [{ text: "The Simple Weekly Meal Planner Busy Families Will Actually Use" }] }), created_at: Math.floor(Date.now() / 1000) - 480 },
  { id: "demo-2", type: "description", input_json: JSON.stringify({ topic: "Small balcony herb garden guide", vibe: "Modern" }), output_json: JSON.stringify({ items: [{ text: "Grow useful herbs in a small space with a clear, beginner-friendly balcony plan." }] }), created_at: Math.floor(Date.now() / 1000) - 86400 },
  { id: "demo-3", type: "caption", input_json: JSON.stringify({ topic: "Autumn soy candle gift set", vibe: "Luxury" }), output_json: JSON.stringify({ items: [{ text: "A warmer way to welcome the season—made for slow evenings and thoughtful gifts." }] }), created_at: Math.floor(Date.now() / 1000) - 259200 },
];

async function getRows() {
  const session = await getSessionFromHeaders(await headers());
  if (!session?.user) return { rows: demoRows, demo: true };
  const env = await getAppEnv();
  if (!env.DB) return { rows: [], demo: false };
  const account = await env.DB.prepare("SELECT plan FROM user WHERE id = ? LIMIT 1").bind(session.user.id).first<{ plan: string }>();
  const paid = account?.plan === "pro" || account?.plan === "business";
  const result = paid
    ? await env.DB.prepare("SELECT id, type, input_json, output_json, created_at FROM generations WHERE user_id = ? AND status = 'completed' AND created_at >= ? ORDER BY created_at DESC LIMIT 500").bind(session.user.id, Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60).all<HistoryRow>()
    : await env.DB.prepare("SELECT id, type, input_json, output_json, created_at FROM generations WHERE user_id = ? AND status = 'completed' ORDER BY created_at DESC LIMIT 20").bind(session.user.id).all<HistoryRow>();
  return { rows: result.results, demo: false };
}

function parseSummary(row: HistoryRow): HistoryItem {
  try {
    const input = JSON.parse(row.input_json) as { topic?: string; vibe?: string };
    const output = row.output_json ? JSON.parse(row.output_json) as { items?: { text: string }[] } : null;
    return { id: row.id, type: row.type, topic: input.topic || "Confirmed source", vibe: input.vibe || "Natural", result: output?.items?.[0]?.text || "No preview available", createdAt: row.created_at };
  } catch {
    return { id: row.id, type: row.type, topic: "Saved generation", vibe: "Natural", result: "No preview available", createdAt: row.created_at };
  }
}

export default async function HistoryPage() {
  const { rows, demo } = await getRows();
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow"><Clock3 aria-hidden="true" size={14} /> Saved generations</p><h1 className="display-font mt-3 text-3xl sm:text-4xl">History</h1><p className="mt-2 text-sm text-[var(--muted-ink)]">Reuse a source, copy a result, or create a new angle without starting again.</p></div>
        <Link href="/pin-title-generator" className="primary-button"><Sparkles aria-hidden="true" size={17} /> New generation</Link>
      </div>
      <HistoryList initial={rows.map(parseSummary)} demo={demo} />
      {demo && <p className="mt-4 text-center text-xs text-[var(--muted-ink)]">Demo entries are shown until you sign in. No demo data is stored.</p>}
    </div>
  );
}
