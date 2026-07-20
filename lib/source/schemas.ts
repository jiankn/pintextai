import { z } from "zod";

export const sourceTypeSchema = z.enum(["manual", "product", "article", "landing"]);
export type SourceType = z.infer<typeof sourceTypeSchema>;

export const sourceSnapshotSchema = z.object({
  type: sourceTypeSchema,
  url: z.url().optional(),
  title: z.string().trim().min(2).max(300),
  summary: z.string().trim().min(2).max(1800),
  details: z.array(z.string().trim().min(1).max(300)).max(8).default([]),
  keywords: z.array(z.string().trim().min(1).max(80)).max(12).default([]),
  imageUrl: z.url().optional(),
});

export type SourceSnapshot = z.infer<typeof sourceSnapshotSchema>;

export const previewRequestSchema = z.object({
  url: z.url(),
  turnstileToken: z.string().max(2048).optional(),
});

export const confirmSourceRequestSchema = z.object({
  previewToken: z.string().min(20).max(12000),
  snapshot: sourceSnapshotSchema,
});
