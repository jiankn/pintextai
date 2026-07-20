import Stripe from "stripe";
import type { AppEnv } from "@/lib/cloudflare";

export function createStripe(env: AppEnv) {
  if (!env.STRIPE_SECRET_KEY) throw new Error("Stripe is not configured.");
  return new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
    maxNetworkRetries: 2,
  });
}

export function appUrl(env: AppEnv) {
  return (env.APP_URL || "http://localhost:3000").replace(/\/$/u, "");
}
