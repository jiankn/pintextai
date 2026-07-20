import { NextResponse } from "next/server";
import { generatePinCopy } from "@/lib/ai/client";
import { generatedResultsSchema, generationRequestSchema } from "@/lib/ai/schemas";
import { getRequestSession } from "@/lib/auth";
import { getAppEnv, requireSecret } from "@/lib/cloudflare";
import { completeGeneration, findIdempotentGeneration, releaseCredit, reserveCredit, type CreditReservation } from "@/lib/quota";
import { enforceRateLimit } from "@/lib/rate-limit";
import { verifySignedJson } from "@/lib/security/crypto";
import { assertSameOrigin, getRiskSubject } from "@/lib/security/request";
import type { SourceSnapshot } from "@/lib/source/schemas";
import type { BrandContext } from "@/lib/ai/prompts";
import { verifyTurnstile } from "@/lib/turnstile";
import { isGeneratorType } from "@/lib/product";

type ConfirmedValue = { snapshot: SourceSnapshot; issuedFor: string };

export async function POST(request: Request, context: { params: Promise<{ type: string }> }) {
  let reservation: CreditReservation | null = null;
  try {
    const { type } = await context.params;
    if (!isGeneratorType(type)) return NextResponse.json({ error: "Unknown generator type." }, { status: 404 });
    const body: unknown = await request.json();
    const input = generationRequestSchema.parse({
      ...(typeof body === "object" && body !== null ? body : {}),
      type,
    });
    const env = await getAppEnv();
    assertSameOrigin(request, env.APP_URL || "http://localhost:3000");
    const subject = await getRiskSubject(request, env);
    const session = await getRequestSession(request);
    if (!session?.user) await verifyTurnstile(request, input.turnstileToken, env);
    let requestLimit = 12;
    if (session?.user && env.DB) {
      const account = await env.DB.prepare("SELECT plan FROM user WHERE id = ? LIMIT 1").bind(session.user.id).first<{ plan: string }>();
      if (account?.plan === "pro" || account?.plan === "business") requestLimit = 70;
    }
    await enforceRateLimit(env, subject, requestLimit, 600);

    const previous = await findIdempotentGeneration(env, input.requestId);
    if (previous?.status === "completed" && previous.output_json) {
      const cached = generatedResultsSchema.parse(JSON.parse(previous.output_json));
      return NextResponse.json({ ...cached, mode: "live", idempotent: true });
    }
    if (previous) return NextResponse.json({ error: "This request is already being processed." }, { status: 409 });

    let source: SourceSnapshot | undefined;
    if (input.confirmedSourceToken) {
      const confirmed = await verifySignedJson<ConfirmedValue>(
        input.confirmedSourceToken,
        requireSecret(env, "SOURCE_PREVIEW_SECRET"),
        "source-confirmed",
      );
      if (confirmed.issuedFor !== subject) throw new Error("This source confirmation belongs to a different session.");
      source = confirmed.snapshot;
    }

    if (input.sourceId) {
      if (!session?.user || !env.DB) throw new Error("Sign in to use a saved source.");
      const row = await env.DB.prepare(
        "SELECT type, source_url, title, summary, details_json, suggested_keywords_json FROM content_sources WHERE id = ? AND user_id = ? LIMIT 1",
      ).bind(input.sourceId, session.user.id).first<{ type: string; source_url: string | null; title: string; summary: string; details_json: string; suggested_keywords_json: string }>();
      if (!row) throw new Error("The saved source was not found.");
      const parseList = (value: string) => { try { return JSON.parse(value) as string[]; } catch { return []; } };
      source = {
        type: row.type === "product" || row.type === "article" || row.type === "landing" ? row.type : "manual",
        url: row.source_url || undefined,
        title: row.title,
        summary: row.summary,
        details: parseList(row.details_json),
        keywords: parseList(row.suggested_keywords_json),
      };
    }
    const trialUsed = request.headers.get("cookie")?.split(";").some((part) => part.trim().startsWith("pintext_trial=used"));
    if (!session?.user && trialUsed) {
      return NextResponse.json({ error: "Log in to continue with 5 free credits per day.", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    let brand: BrandContext | undefined;
    if (input.brandProfileId) {
      if (!session?.user || !env.DB) throw new Error("Sign in to use a brand profile.");
      const row = await env.DB.prepare(
        "SELECT name, audience, voice, default_cta, banned_terms_json, keywords_json FROM brand_profiles WHERE id = ? AND user_id = ? LIMIT 1",
      ).bind(input.brandProfileId, session.user.id).first<{ name: string; audience: string | null; voice: string | null; default_cta: string | null; banned_terms_json: string; keywords_json: string }>();
      if (!row) throw new Error("The selected brand profile was not found.");
      const parseBrandList = (value: string) => { try { return JSON.parse(value) as string[]; } catch { return []; } };
      brand = { name: row.name, audience: row.audience || "", voice: row.voice || "", defaultCta: row.default_cta || "", bannedTerms: parseBrandList(row.banned_terms_json), keywords: parseBrandList(row.keywords_json) };
    }

    if (session?.user) {
      reservation = await reserveCredit(env, input, session.user.id, source);
    } else if (process.env.NODE_ENV === "production" && !env.DB) {
      throw new Error("The database is unavailable, so no AI request was started.");
    }

    const ai = await generatePinCopy(input, source, env, subject, brand);
    if (reservation) await completeGeneration(env, reservation, ai.results, ai.model, ai.inputTokens, ai.outputTokens);

    const response = NextResponse.json({ ...ai.results, mode: ai.mode, remaining: reservation?.remaining, generationId: reservation?.generationId });
    if (!session?.user) {
      response.cookies.set("pintext_trial", "used", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed.";
    if (reservation) await releaseCredit(await getAppEnv(), reservation, "AI_FAILED");
    console.error(JSON.stringify({ message: "generation_failed", error: message }));
    const quota = message.includes("credit") || message.includes("allowance");
    return NextResponse.json({ error: message, code: quota ? "QUOTA_EXHAUSTED" : "GENERATION_FAILED" }, { status: quota ? 402 : 400 });
  }
}
