import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { createDatabase } from "@/db/client";
import { account, session, user, verification } from "@/db/schema";
import { getAppEnv, requireSecret, type AppEnv } from "@/lib/cloudflare";

export async function createAuth(envOverride?: AppEnv) {
  const env = envOverride || (await getAppEnv());
  const database = createDatabase(env);
  const google = env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } }
    : {};

  return betterAuth({
    appName: "PinTextAI",
    baseURL: env.APP_URL || "http://localhost:3000",
    secret: requireSecret(env, "BETTER_AUTH_SECRET"),
    database: drizzleAdapter(database, {
      provider: "sqlite",
      schema: { user, session, account, verification },
    }),
    socialProviders: google,
    user: {
      additionalFields: {
        plan: { type: "string", defaultValue: "free", input: false },
      },
    },
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
    advanced: {
      defaultCookieAttributes: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    },
    trustedOrigins: [env.APP_URL || "http://localhost:3000", "http://localhost:3000"],
  });
}

export async function getRequestSession(request: Request) {
  try {
    const auth = await createAuth();
    return await auth.api.getSession({ headers: request.headers });
  } catch {
    return null;
  }
}

export async function getSessionFromHeaders(headers: Headers) {
  try {
    const auth = await createAuth();
    return await auth.api.getSession({ headers });
  } catch {
    return null;
  }
}
