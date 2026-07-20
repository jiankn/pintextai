import { NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { getAppEnv } from "@/lib/cloudflare";
import { appUrl, createStripe } from "@/lib/stripe";
import { assertSameOrigin } from "@/lib/security/request";

export async function POST(request: Request) {
  try {
    const env = await getAppEnv();
    assertSameOrigin(request, env.APP_URL || "http://localhost:3000");
    const session = await getRequestSession(request);
    if (!session?.user) return NextResponse.json({ error: "Sign in to manage billing." }, { status: 401 });
    if (!env.DB) return NextResponse.json({ error: "The database is unavailable." }, { status: 503 });
    const saved = await env.DB.prepare("SELECT stripe_customer_id FROM subscriptions WHERE user_id = ? LIMIT 1")
      .bind(session.user.id)
      .first<{ stripe_customer_id: string }>();
    if (!saved) return NextResponse.json({ error: "No Stripe customer is attached to this account." }, { status: 404 });
    const portal = await createStripe(env).billingPortal.sessions.create({
      customer: saved.stripe_customer_id,
      return_url: `${appUrl(env)}/dashboard/billing`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The billing portal could not be opened.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
