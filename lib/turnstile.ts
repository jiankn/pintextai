import type { AppEnv } from "@/lib/cloudflare";

type TurnstileResponse = {
  success: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

export async function verifyTurnstile(request: Request, token: string | undefined, env: AppEnv, expectedAction = "generate") {
  if (!env.TURNSTILE_SECRET_KEY) return { success: true, skipped: true };
  if (!token) throw new Error("Complete the security check and try again.");

  const form = new FormData();
  form.set("secret", env.TURNSTILE_SECRET_KEY);
  form.set("response", token);
  form.set("idempotency_key", crypto.randomUUID());
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) form.set("remoteip", ip);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) throw new Error("Security verification is temporarily unavailable. Please retry.");
  const result = (await response.json()) as TurnstileResponse;
  if (!result.success || (result.action && result.action !== expectedAction)) {
    throw new Error("Security verification expired or was rejected. Refresh it and try again.");
  }
  return result;
}
