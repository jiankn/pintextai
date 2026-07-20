import type { AppEnv } from "@/lib/cloudflare";

export async function enforceRateLimit(env: AppEnv, subjectHash: string, limit: number, windowSeconds: number) {
  if (!env.DB) return;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / windowSeconds) * windowSeconds;
  const expiresAt = windowStart + windowSeconds * 2;
  const result = await env.DB.prepare(
    `INSERT INTO abuse_signals (subject_hash, window_start, request_count, expires_at)
     VALUES (?, ?, 1, ?)
     ON CONFLICT(subject_hash, window_start) DO UPDATE SET request_count = request_count + 1
     WHERE request_count < ?
     RETURNING request_count`,
  )
    .bind(subjectHash, windowStart, expiresAt, limit)
    .first<{ request_count: number }>();

  if (!result) throw new Error("Too many requests from this device. Wait a few minutes and try again.");
}
