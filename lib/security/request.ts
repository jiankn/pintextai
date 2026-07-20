import type { AppEnv } from "@/lib/cloudflare";
import { privacyHash } from "@/lib/security/crypto";

export async function getRiskSubject(request: Request, env: AppEnv) {
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const userAgent = request.headers.get("user-agent")?.slice(0, 180) || "unknown";
  const secret = env.ABUSE_HASH_SECRET || "pintextai-local-risk-key";
  return privacyHash(`${ip}|${userAgent}`, secret);
}

export function assertSameOrigin(request: Request, appUrl: string) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const allowed = new URL(appUrl).origin;
  const localPattern = /^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/u;
  const localDevelopment = localPattern.test(allowed) && localPattern.test(origin);
  if (origin !== allowed && !localDevelopment) {
    throw new Error("This request came from an untrusted origin.");
  }
}
