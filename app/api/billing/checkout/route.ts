import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestSession } from "@/lib/auth";
import { getAppEnv } from "@/lib/cloudflare";
import { appUrl, createStripe } from "@/lib/stripe";
import { assertSameOrigin } from "@/lib/security/request";

const checkoutSchema = z.object({ interval: z.enum(["month", "year"]) });

export async function POST(request: Request) {
  try {
    const env = await getAppEnv();
    assertSameOrigin(request, env.APP_URL || "http://localhost:3000");
    const session = await getRequestSession(request);
    if (!session?.user) return NextResponse.json({ error: "Sign in before starting checkout." }, { status: 401 });
    const { interval } = checkoutSchema.parse(await request.json());
    if (!env.DB) return NextResponse.json({ error: "The database is unavailable." }, { status: 503 });
    const priceId = interval === "year" ? env.STRIPE_PRO_YEARLY_PRICE_ID : env.STRIPE_PRO_MONTHLY_PRICE_ID;
    if (!priceId) return NextResponse.json({ error: "This Pro price is not configured yet." }, { status: 503 });

    const stripe = createStripe(env);
    const saved = await env.DB.prepare("SELECT stripe_customer_id FROM subscriptions WHERE user_id = ? LIMIT 1")
      .bind(session.user.id)
      .first<{ stripe_customer_id: string }>();
    let customerId = saved?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name,
        metadata: { pintextaiUserId: session.user.id },
      });
      customerId = customer.id;
      await env.DB.prepare(
        `INSERT INTO subscriptions (id, user_id, stripe_customer_id, plan, status, updated_at)
         VALUES (?, ?, ?, 'free', 'customer_created', ?)
         ON CONFLICT(stripe_customer_id) DO UPDATE SET user_id = excluded.user_id, updated_at = excluded.updated_at`,
      ).bind(crypto.randomUUID(), session.user.id, customerId, Math.floor(Date.now() / 1000)).run();
    }

    const base = appUrl(env);
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: session.user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${base}/dashboard/billing?checkout=success`,
      cancel_url: `${base}/pricing?checkout=cancelled`,
      metadata: { pintextaiUserId: session.user.id, plan: "pro", interval },
      subscription_data: { metadata: { pintextaiUserId: session.user.id, plan: "pro" } },
    });
    if (!checkout.url) throw new Error("Stripe did not return a checkout URL.");
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout could not be started.";
    console.error(JSON.stringify({ message: "checkout_failed", error: message }));
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
