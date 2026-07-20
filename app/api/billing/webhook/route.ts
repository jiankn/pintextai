import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAppEnv } from "@/lib/cloudflare";
import { createStripe } from "@/lib/stripe";

function objectId(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id || null;
}

async function updateSubscription(env: Awaited<ReturnType<typeof getAppEnv>>, subscription: Stripe.Subscription) {
  if (!env.DB) throw new Error("The database is unavailable.");
  const customerId = objectId(subscription.customer);
  if (!customerId) throw new Error("Stripe subscription has no customer id.");
  const existing = await env.DB.prepare("SELECT user_id FROM subscriptions WHERE stripe_customer_id = ? LIMIT 1")
    .bind(customerId)
    .first<{ user_id: string }>();
  const userId = subscription.metadata.pintextaiUserId || existing?.user_id;
  if (!userId) throw new Error("The Stripe customer is not linked to a PinTextAI user.");
  const paid = ["active", "trialing"].includes(subscription.status);
  const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end || null;
  const now = Math.floor(Date.now() / 1000);
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(stripe_customer_id) DO UPDATE SET
         user_id = excluded.user_id,
         stripe_subscription_id = excluded.stripe_subscription_id,
         plan = excluded.plan,
         status = excluded.status,
         current_period_end = excluded.current_period_end,
         updated_at = excluded.updated_at`,
    ).bind(crypto.randomUUID(), userId, customerId, subscription.id, paid ? "pro" : "free", subscription.status, periodEnd, now),
    env.DB.prepare("UPDATE user SET plan = ?, updated_at = ? WHERE id = ?").bind(paid ? "pro" : "free", now, userId),
  ]);
}

export async function POST(request: Request) {
  const env = await getAppEnv();
  if (!env.DB || !env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = await createStripe(env).webhooks.constructEventAsync(
      await request.text(),
      signature,
      env.STRIPE_WEBHOOK_SECRET,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid webhook signature." }, { status: 400 });
  }

  const previous = await env.DB.prepare("SELECT status FROM webhook_events WHERE provider = 'stripe' AND event_id = ? LIMIT 1")
    .bind(event.id)
    .first<{ status: string }>();
  if (previous?.status === "processed") return NextResponse.json({ received: true, duplicate: true });
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    `INSERT INTO webhook_events (provider, event_id, event_type, processed_at, status)
     VALUES ('stripe', ?, ?, ?, 'processing')
     ON CONFLICT(provider, event_id) DO UPDATE SET status = 'processing', processed_at = excluded.processed_at`,
  ).bind(event.id, event.type, now).run();

  try {
    if (event.type === "checkout.session.completed") {
      const checkout = event.data.object;
      const subscriptionId = objectId(checkout.subscription);
      if (subscriptionId) await updateSubscription(env, await createStripe(env).subscriptions.retrieve(subscriptionId));
    }
    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      await updateSubscription(env, event.data.object);
    }
    await env.DB.prepare("UPDATE webhook_events SET status = 'processed', processed_at = ? WHERE provider = 'stripe' AND event_id = ?")
      .bind(Math.floor(Date.now() / 1000), event.id)
      .run();
    return NextResponse.json({ received: true });
  } catch (error) {
    await env.DB.prepare("UPDATE webhook_events SET status = 'failed', processed_at = ? WHERE provider = 'stripe' AND event_id = ?")
      .bind(Math.floor(Date.now() / 1000), event.id)
      .run();
    console.error(JSON.stringify({ message: "stripe_webhook_failed", eventId: event.id, error: error instanceof Error ? error.message : "Unknown error" }));
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
