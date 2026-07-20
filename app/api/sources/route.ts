import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestSession } from "@/lib/auth";
import { getAppEnv } from "@/lib/cloudflare";
import { privacyHash } from "@/lib/security/crypto";
import { assertSameOrigin } from "@/lib/security/request";

const inputSchema = z.object({
  type: z.enum(["product", "article", "landing"]),
  title: z.string().trim().min(2).max(300),
  summary: z.string().trim().min(2).max(1800),
  sourceUrl: z.union([z.literal(""), z.url()]).optional(),
  details: z.array(z.string().trim().min(1).max(300)).max(8).optional().default([]),
  keywords: z.array(z.string().trim().min(1).max(80)).max(12).optional().default([]),
});

export async function GET(request: Request) {
  const session = await getRequestSession(request);
  if (!session?.user) return NextResponse.json({ error: "Sign in to view saved content." }, { status: 401 });
  const env = await getAppEnv();
  if (!env.DB) return NextResponse.json({ error: "The database is unavailable." }, { status: 503 });
  const result = await env.DB.prepare(
    "SELECT id, type, source_url, title, summary, details_json, suggested_keywords_json, fetched_at, created_at, updated_at FROM content_sources WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100",
  ).bind(session.user.id).all();
  return NextResponse.json({ items: result.results });
}

export async function POST(request: Request) {
  try {
    const session = await getRequestSession(request);
    if (!session?.user) return NextResponse.json({ error: "Sign in to save content." }, { status: 401 });
    const input = inputSchema.parse(await request.json());
    const env = await getAppEnv();
    assertSameOrigin(request, env.APP_URL || "http://localhost:3000");
    if (!env.DB) return NextResponse.json({ error: "The database is unavailable." }, { status: 503 });
    const now = Math.floor(Date.now() / 1000);
    const sourceHash = await privacyHash(input.sourceUrl || `${input.type}|${input.title}`, env.ABUSE_HASH_SECRET || "pintextai-source-hash");
    const existing = await env.DB.prepare("SELECT id FROM content_sources WHERE user_id = ? AND source_hash = ? ORDER BY updated_at DESC LIMIT 1").bind(session.user.id, sourceHash).first<{ id: string }>();
    if (existing) {
      await env.DB.prepare(
        "UPDATE content_sources SET type = ?, source_url = ?, title = ?, summary = ?, details_json = ?, suggested_keywords_json = ?, user_edited_at = ?, fetched_at = ?, updated_at = ? WHERE id = ? AND user_id = ?",
      ).bind(input.type, input.sourceUrl || null, input.title, input.summary, JSON.stringify(input.details), JSON.stringify(input.keywords), now, input.sourceUrl ? now : null, now, existing.id, session.user.id).run();
      return NextResponse.json({ id: existing.id, updated: true });
    }
    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO content_sources
       (id, user_id, type, source_url, title, summary, details_json, suggested_keywords_json, source_hash, user_edited_at, fetched_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(id, session.user.id, input.type, input.sourceUrl || null, input.title, input.summary, JSON.stringify(input.details), JSON.stringify(input.keywords), sourceHash, now, input.sourceUrl ? now : null, now, now).run();
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The source could not be saved.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const env = await getAppEnv();
  assertSameOrigin(request, env.APP_URL || "http://localhost:3000");
  const session = await getRequestSession(request);
  if (!session?.user) return NextResponse.json({ error: "Sign in to delete content." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "A source id is required." }, { status: 400 });
  if (!env.DB) return NextResponse.json({ error: "The database is unavailable." }, { status: 503 });
  await env.DB.prepare("DELETE FROM content_sources WHERE id = ? AND user_id = ?").bind(id, session.user.id).run();
  return NextResponse.json({ success: true });
}
