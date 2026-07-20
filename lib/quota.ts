import type { GeneratedResults, GenerationRequest } from "@/lib/ai/schemas";
import type { AppEnv } from "@/lib/cloudflare";
import type { SourceSnapshot } from "@/lib/source/schemas";

export type CreditReservation = {
  generationId: string;
  userId: string;
  plan: "free" | "pro" | "business";
  bucket: "daily" | "monthly";
  period: string;
  remaining: number;
};

function utcDay() {
  return new Date().toISOString().slice(0, 10);
}

function utcMonth() {
  return new Date().toISOString().slice(0, 7);
}

export async function findIdempotentGeneration(env: AppEnv, requestId: string) {
  if (!env.DB) return null;
  return env.DB.prepare("SELECT status, output_json FROM generations WHERE request_id = ? LIMIT 1")
    .bind(requestId)
    .first<{ status: string; output_json: string | null }>();
}

export async function reserveCredit(
  env: AppEnv,
  request: GenerationRequest,
  userId: string,
  source: SourceSnapshot | undefined,
): Promise<CreditReservation> {
  if (!env.DB) throw new Error("The database is unavailable, so no AI credit was spent.");
  const now = Math.floor(Date.now() / 1000);
  const generationId = crypto.randomUUID();
  const inserted = await env.DB.prepare(
    `INSERT INTO generations
      (id, request_id, user_id, source_snapshot_json, type, input_json, prompt_version, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pin-copy.v1', 'reserved', ?, ?)
     ON CONFLICT(request_id) DO NOTHING`,
  )
    .bind(
      generationId,
      request.requestId,
      userId,
      source ? JSON.stringify(source) : null,
      request.type,
      JSON.stringify({ ...request, confirmedSourceToken: undefined, turnstileToken: undefined }),
      now,
      now,
    )
    .run();
  if ((inserted.meta.changes || 0) !== 1) throw new Error("This generation request is already being processed.");

  const planRow = await env.DB.prepare("SELECT plan FROM user WHERE id = ? LIMIT 1").bind(userId).first<{ plan: string }>();
  const plan = planRow?.plan === "pro" || planRow?.plan === "business" ? planRow.plan : "free";
  const bucket = plan === "free" ? "daily" : "monthly";
  const period = bucket === "daily" ? utcDay() : utcMonth();
  const limit = plan === "business" ? 4000 : plan === "pro" ? 1000 : 5;
  const table = bucket === "daily" ? "usage_daily" : "usage_monthly";
  const subjectColumn = bucket === "daily" ? "subject_id" : "user_id";
  const periodColumn = bucket === "daily" ? "usage_date" : "period";

  await env.DB.prepare(
    `INSERT INTO ${table} (${subjectColumn}, ${periodColumn}, used, limit_value, updated_at)
     VALUES (?, ?, 0, ?, ?)
     ON CONFLICT(${subjectColumn}, ${periodColumn}) DO NOTHING`,
  ).bind(userId, period, limit, now).run();

  const usage = await env.DB.prepare(
    `UPDATE ${table} SET used = used + 1, updated_at = ?
     WHERE ${subjectColumn} = ? AND ${periodColumn} = ? AND used < limit_value
     RETURNING used, limit_value`,
  ).bind(now, userId, period).first<{ used: number; limit_value: number }>();

  if (!usage) {
    await env.DB.prepare("UPDATE generations SET status = 'failed', error_code = 'QUOTA_EXHAUSTED', updated_at = ? WHERE id = ?").bind(now, generationId).run();
    throw new Error(plan === "free" ? "You have used today’s 5 free credits. Upgrade or return after 00:00 UTC." : "This month’s credit allowance has been used.");
  }
  return { generationId, userId, plan, bucket, period, remaining: usage.limit_value - usage.used };
}

export async function releaseCredit(env: AppEnv, reservation: CreditReservation, errorCode: string) {
  if (!env.DB) return;
  const now = Math.floor(Date.now() / 1000);
  const table = reservation.bucket === "daily" ? "usage_daily" : "usage_monthly";
  const subjectColumn = reservation.bucket === "daily" ? "subject_id" : "user_id";
  const periodColumn = reservation.bucket === "daily" ? "usage_date" : "period";
  await env.DB.batch([
    env.DB.prepare(`UPDATE ${table} SET used = MAX(0, used - 1), updated_at = ? WHERE ${subjectColumn} = ? AND ${periodColumn} = ?`).bind(now, reservation.userId, reservation.period),
    env.DB.prepare("UPDATE generations SET status = 'failed', error_code = ?, updated_at = ? WHERE id = ?").bind(errorCode, now, reservation.generationId),
  ]);
}

export async function completeGeneration(
  env: AppEnv,
  reservation: CreditReservation,
  results: GeneratedResults,
  model: string,
  inputTokens: number,
  outputTokens: number,
) {
  if (!env.DB) return;
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    `UPDATE generations SET output_json = ?, model = ?, input_tokens = ?, output_tokens = ?, status = 'completed', updated_at = ? WHERE id = ?`,
  ).bind(JSON.stringify(results), model, inputTokens, outputTokens, now, reservation.generationId).run();
}
