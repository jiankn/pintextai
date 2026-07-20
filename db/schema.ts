import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const user = sqliteTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
    image: text("image"),
    plan: text("plan", { enum: ["free", "pro", "business"] }).notNull().default("free"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [uniqueIndex("user_email_unique").on(table.email)],
);

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("session_token_unique").on(table.token), index("session_user_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("account_user_idx").on(table.userId), uniqueIndex("account_provider_unique").on(table.providerId, table.accountId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    stripeCustomerId: text("stripe_customer_id").notNull(),
    stripeSubscriptionId: text("stripe_subscription_id"),
    plan: text("plan").notNull(),
    status: text("status").notNull(),
    currentPeriodEnd: integer("current_period_end"),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("subscription_customer_unique").on(table.stripeCustomerId),
    uniqueIndex("subscription_stripe_unique").on(table.stripeSubscriptionId),
    index("subscription_user_idx").on(table.userId),
  ],
);

export const usageDaily = sqliteTable(
  "usage_daily",
  {
    subjectId: text("subject_id").notNull(),
    usageDate: text("usage_date").notNull(),
    used: integer("used").notNull().default(0),
    limit: integer("limit_value").notNull().default(5),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.subjectId, table.usageDate] })],
);

export const usageMonthly = sqliteTable(
  "usage_monthly",
  {
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    period: text("period").notNull(),
    used: integer("used").notNull().default(0),
    limit: integer("limit_value").notNull().default(1000),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.period] })],
);

export const contentSources = sqliteTable(
  "content_sources",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    sourceUrl: text("source_url"),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    detailsJson: text("details_json").notNull().default("[]"),
    suggestedKeywordsJson: text("suggested_keywords_json").notNull().default("[]"),
    sourceHash: text("source_hash").notNull(),
    userEditedAt: integer("user_edited_at"),
    fetchedAt: integer("fetched_at"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [index("content_sources_user_created_idx").on(table.userId, table.createdAt), index("content_sources_user_hash_idx").on(table.userId, table.sourceHash)],
);

export const brandProfiles = sqliteTable(
  "brand_profiles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    audience: text("audience"),
    voice: text("voice"),
    defaultCta: text("default_cta"),
    bannedTermsJson: text("banned_terms_json").notNull().default("[]"),
    keywordsJson: text("keywords_json").notNull().default("[]"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [index("brand_profiles_user_name_idx").on(table.userId, table.name)],
);

export const generations = sqliteTable(
  "generations",
  {
    id: text("id").primaryKey(),
    requestId: text("request_id").notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    sourceId: text("source_id").references(() => contentSources.id, { onDelete: "set null" }),
    sourceSnapshotJson: text("source_snapshot_json"),
    type: text("type").notNull(),
    inputJson: text("input_json").notNull(),
    outputJson: text("output_json"),
    model: text("model"),
    promptVersion: text("prompt_version").notNull(),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    costEstimate: integer("cost_estimate_micros"),
    status: text("status").notNull(),
    errorCode: text("error_code"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("generations_request_unique").on(table.requestId),
    index("generations_user_created_idx").on(table.userId, table.createdAt),
    index("generations_source_created_idx").on(table.sourceId, table.createdAt),
  ],
);

export const generationFeedback = sqliteTable(
  "generation_feedback",
  {
    id: text("id").primaryKey(),
    generationId: text("generation_id").notNull().references(() => generations.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    rating: integer("rating").notNull(),
    reason: text("reason"),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("feedback_generation_idx").on(table.generationId)],
);

export const batchJobs = sqliteTable("batch_jobs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  brandProfileId: text("brand_profile_id").references(() => brandProfiles.id, { onDelete: "set null" }),
  status: text("status").notNull(),
  total: integer("total").notNull(),
  succeeded: integer("succeeded").notNull().default(0),
  failed: integer("failed").notNull().default(0),
  reservedCredits: integer("reserved_credits").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const batchItems = sqliteTable(
  "batch_items",
  {
    id: text("id").primaryKey(),
    batchJobId: text("batch_job_id").notNull().references(() => batchJobs.id, { onDelete: "cascade" }),
    sourceUrl: text("source_url"),
    sourceId: text("source_id").references(() => contentSources.id, { onDelete: "set null" }),
    inputJson: text("input_json").notNull(),
    generationId: text("generation_id").references(() => generations.id, { onDelete: "set null" }),
    status: text("status").notNull(),
    errorCode: text("error_code"),
  },
  (table) => [index("batch_items_job_status_idx").on(table.batchJobId, table.status)],
);

export const webhookEvents = sqliteTable(
  "webhook_events",
  {
    provider: text("provider").notNull(),
    eventId: text("event_id").notNull(),
    eventType: text("event_type").notNull(),
    processedAt: integer("processed_at").notNull(),
    status: text("status").notNull(),
  },
  (table) => [primaryKey({ columns: [table.provider, table.eventId] })],
);

export const abuseSignals = sqliteTable(
  "abuse_signals",
  {
    subjectHash: text("subject_hash").notNull(),
    windowStart: integer("window_start").notNull(),
    requestCount: integer("request_count").notNull().default(1),
    expiresAt: integer("expires_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.subjectHash, table.windowStart] }), index("abuse_expires_idx").on(table.expiresAt)],
);

export const schema = {
  user,
  session,
  account,
  verification,
  subscriptions,
  usageDaily,
  usageMonthly,
  contentSources,
  brandProfiles,
  generations,
  generationFeedback,
  batchJobs,
  batchItems,
  webhookEvents,
  abuseSignals,
};
