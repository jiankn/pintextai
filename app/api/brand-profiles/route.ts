import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestSession } from "@/lib/auth";
import { getAppEnv } from "@/lib/cloudflare";
import { assertSameOrigin } from "@/lib/security/request";

const profileSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2).max(80),
  audience: z.string().trim().max(300).optional().default(""),
  voice: z.string().trim().max(300).optional().default(""),
  defaultCta: z.string().trim().max(120).optional().default(""),
  bannedTerms: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
  keywords: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
});

async function requireAccount(request: Request) {
  const session = await getRequestSession(request);
  const env = await getAppEnv();
  return { session, env };
}

export async function GET(request: Request) {
  const { session, env } = await requireAccount(request);
  if (!session?.user) return NextResponse.json({ error: "Sign in to view brand profiles." }, { status: 401 });
  if (!env.DB) return NextResponse.json({ error: "The database is unavailable." }, { status: 503 });
  const result = await env.DB.prepare("SELECT id, name, audience, voice, default_cta, banned_terms_json, keywords_json, created_at, updated_at FROM brand_profiles WHERE user_id = ? ORDER BY updated_at DESC")
    .bind(session.user.id).all();
  return NextResponse.json({ items: result.results });
}

export async function POST(request: Request) {
  try {
    const { session, env } = await requireAccount(request);
    assertSameOrigin(request, env.APP_URL || "http://localhost:3000");
    if (!session?.user) return NextResponse.json({ error: "Sign in to save a brand profile." }, { status: 401 });
    if (!env.DB) return NextResponse.json({ error: "The database is unavailable." }, { status: 503 });
    const input = profileSchema.parse(await request.json());
    const now = Math.floor(Date.now() / 1000);
    if (input.id) {
      const result = await env.DB.prepare(
        "UPDATE brand_profiles SET name = ?, audience = ?, voice = ?, default_cta = ?, banned_terms_json = ?, keywords_json = ?, updated_at = ? WHERE id = ? AND user_id = ?",
      ).bind(input.name, input.audience || null, input.voice || null, input.defaultCta || null, JSON.stringify(input.bannedTerms), JSON.stringify(input.keywords), now, input.id, session.user.id).run();
      if ((result.meta.changes || 0) !== 1) return NextResponse.json({ error: "Brand profile not found." }, { status: 404 });
      return NextResponse.json({ id: input.id });
    }
    const account = await env.DB.prepare("SELECT plan FROM user WHERE id = ? LIMIT 1").bind(session.user.id).first<{ plan: string }>();
    const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM brand_profiles WHERE user_id = ?").bind(session.user.id).first<{ total: number }>();
    const limit = account?.plan === "pro" || account?.plan === "business" ? 10 : 1;
    if ((count?.total || 0) >= limit) return NextResponse.json({ error: `Your plan supports ${limit} brand profile${limit === 1 ? "" : "s"}.` }, { status: 402 });
    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO brand_profiles (id, user_id, name, audience, voice, default_cta, banned_terms_json, keywords_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(id, session.user.id, input.name, input.audience || null, input.voice || null, input.defaultCta || null, JSON.stringify(input.bannedTerms), JSON.stringify(input.keywords), now, now).run();
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The brand profile could not be saved." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { session, env } = await requireAccount(request);
  assertSameOrigin(request, env.APP_URL || "http://localhost:3000");
  if (!session?.user) return NextResponse.json({ error: "Sign in to delete a brand profile." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "A brand profile id is required." }, { status: 400 });
  if (!env.DB) return NextResponse.json({ error: "The database is unavailable." }, { status: 503 });
  await env.DB.prepare("DELETE FROM brand_profiles WHERE id = ? AND user_id = ?").bind(id, session.user.id).run();
  return NextResponse.json({ success: true });
}
