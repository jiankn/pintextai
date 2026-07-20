import { NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { getAppEnv } from "@/lib/cloudflare";

export async function GET(request: Request) {
  const session = await getRequestSession(request);
  if (!session?.user) return NextResponse.json({ authenticated: false, plan: "anonymous", limit: 1 });
  const env = await getAppEnv();
  const planRow = env.DB ? await env.DB.prepare("SELECT plan FROM user WHERE id = ? LIMIT 1").bind(session.user.id).first<{ plan: string }>() : null;
  const plan = planRow?.plan || "free";
  const date = new Date().toISOString().slice(0, plan === "free" ? 10 : 7);
  const table = plan === "free" ? "usage_daily" : "usage_monthly";
  const userColumn = plan === "free" ? "subject_id" : "user_id";
  const periodColumn = plan === "free" ? "usage_date" : "period";
  const usage = env.DB ? await env.DB.prepare(`SELECT used, limit_value FROM ${table} WHERE ${userColumn} = ? AND ${periodColumn} = ?`).bind(session.user.id, date).first<{ used: number; limit_value: number }>() : null;
  const limit = usage?.limit_value || (plan === "business" ? 4000 : plan === "pro" ? 1000 : 5);
  const used = usage?.used || 0;
  return NextResponse.json({ authenticated: true, plan, used, limit, remaining: Math.max(0, limit - used), period: date, resetTimezone: "UTC" });
}
