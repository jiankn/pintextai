import { NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { getAppEnv } from "@/lib/cloudflare";
import { assertSameOrigin } from "@/lib/security/request";

export async function DELETE(request: Request) {
  const env = await getAppEnv();
  assertSameOrigin(request, env.APP_URL || "http://localhost:3000");
  const session = await getRequestSession(request);
  if (!session?.user) return NextResponse.json({ error: "Sign in to delete history." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "A generation id is required." }, { status: 400 });
  if (!env.DB) return NextResponse.json({ error: "The database is unavailable." }, { status: 503 });
  await env.DB.prepare("DELETE FROM generations WHERE id = ? AND user_id = ?").bind(id, session.user.id).run();
  return NextResponse.json({ success: true });
}
