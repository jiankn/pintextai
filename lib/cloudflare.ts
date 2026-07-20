import { getCloudflareContext } from "@opennextjs/cloudflare";

export type AppEnv = Partial<CloudflareEnv>;

function processEnvironment(): AppEnv {
  return {
    APP_URL: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    AI_BUDGET_MODE: process.env.AI_BUDGET_MODE,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AI_GATEWAY_BASE_URL: process.env.AI_GATEWAY_BASE_URL,
    SOURCE_PREVIEW_SECRET: process.env.SOURCE_PREVIEW_SECRET,
    ABUSE_HASH_SECRET: process.env.ABUSE_HASH_SECRET,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRO_MONTHLY_PRICE_ID: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    STRIPE_PRO_YEARLY_PRICE_ID: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  };
}

export async function getAppEnv(): Promise<AppEnv> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return { ...processEnvironment(), ...env };
  } catch {
    return processEnvironment();
  }
}

export function requireSecret(env: AppEnv, name: keyof AppEnv): string {
  const value = env[name];
  if (typeof value === "string" && value.length >= 16) return value;
  if (process.env.NODE_ENV !== "production") return `pintextai-local-${String(name)}-replace-before-production`;
  throw new Error(`${String(name)} is not configured.`);
}
