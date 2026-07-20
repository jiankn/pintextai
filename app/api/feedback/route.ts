import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestSession } from "@/lib/auth";
import { getAppEnv } from "@/lib/cloudflare";
import { assertSameOrigin } from "@/lib/security/request";

const schema = z.object({ generationId: z.uuid(), rating: z.union([z.literal(1), z.literal(-1)]), reason: z.string().trim().max(500).optional() });

export async function POST(request: Request) {
  try {
    const session = await getRequestSession(request);
    if (!session?.user) return NextResponse.json({ error: "Sign in to save feedback." }, { status: 401 });
    const env = await getAppEnv();
    assertSameOrigin(request, env.APP_URL || "http://localhost:3000");
    const input = schema.parse(await request.json());
    if (!env.DB) return NextResponse.json({ error: "The database is unavailable." }, { status: 503 });
    const generation = await env.DB.prepare("SELECT id FROM generations WHERE id = ? AND user_id = ? LIMIT 1").bind(input.generationId, session.user.id).first();
    if (!generation) return NextResponse.json({ error: "Generation not found." }, { status: 404 });
    await env.DB.prepare("INSERT INTO generation_feedback (id, generation_id, user_id, rating, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), input.generationId, session.user.id, input.rating, input.reason || null, Math.floor(Date.now() / 1000)).run();
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Feedback could not be saved.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
