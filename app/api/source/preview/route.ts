import { NextResponse } from "next/server";
import { getAppEnv, requireSecret } from "@/lib/cloudflare";
import { enforceRateLimit } from "@/lib/rate-limit";
import { signJson } from "@/lib/security/crypto";
import { assertSameOrigin, getRiskSubject } from "@/lib/security/request";
import { extractSourceSnapshot } from "@/lib/source/extract";
import { fetchSourcePage } from "@/lib/source/fetch";
import { previewRequestSchema } from "@/lib/source/schemas";
import { verifyTurnstile } from "@/lib/turnstile";
import { getRequestSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const input = previewRequestSchema.parse(await request.json());
    const env = await getAppEnv();
    assertSameOrigin(request, env.APP_URL || "http://localhost:3000");
    const session = await getRequestSession(request);
    if (!session?.user) await verifyTurnstile(request, input.turnstileToken, env);
    const subject = await getRiskSubject(request, env);
    await enforceRateLimit(env, subject, session?.user ? 60 : 8, 600);
    const { html, finalUrl, elapsedMs } = await fetchSourcePage(input.url);
    const snapshot = extractSourceSnapshot(html, finalUrl);
    const previewToken = await signJson(
      { snapshot, issuedFor: subject },
      requireSecret(env, "SOURCE_PREVIEW_SECRET"),
      "source-preview",
      10 * 60,
    );
    return NextResponse.json({ snapshot, previewToken, elapsedMs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The source could not be previewed.";
    console.error(JSON.stringify({ message: "source_preview_failed", error: message }));
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
