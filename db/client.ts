import { drizzle } from "drizzle-orm/d1";
import type { AppEnv } from "@/lib/cloudflare";
import * as schema from "@/db/schema";

export function createDatabase(env: AppEnv) {
  if (!env.DB) throw new Error("The D1 database binding is unavailable.");
  return drizzle(env.DB, { schema });
}
