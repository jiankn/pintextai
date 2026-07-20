import { z } from "zod";
import { GENERATOR_TYPES, GOALS, VIBES } from "@/lib/product";

export const generatedItemSchema = z.object({
  text: z.string().trim().min(2).max(800),
  keyword: z.string().trim().max(120).default(""),
  angle: z.string().trim().max(80).default(""),
});

export const generatedResultsSchema = z.object({
  items: z.array(generatedItemSchema).length(10),
});

export type GeneratedItem = z.infer<typeof generatedItemSchema>;
export type GeneratedResults = z.infer<typeof generatedResultsSchema>;

export const generationRequestSchema = z
  .object({
    requestId: z.uuid(),
    type: z.enum(GENERATOR_TYPES),
    topic: z.string().trim().min(2).max(2000).optional(),
    sourceId: z.uuid().optional(),
    confirmedSourceToken: z.string().min(20).max(12000).optional(),
    goal: z.enum(GOALS).default("Get clicks"),
    vibe: z.enum(VIBES).default("Natural"),
    angle: z.string().trim().max(80).optional(),
    keyword: z.string().trim().max(120).optional(),
    audience: z.string().trim().max(200).optional(),
    brandProfileId: z.uuid().optional(),
    cta: z.enum(["Auto", "Save", "Shop", "Read", "Learn"]).default("Auto"),
    turnstileToken: z.string().max(2048).optional(),
  })
  .refine((value) => Boolean(value.topic || value.confirmedSourceToken || value.sourceId), {
    message: "Provide a topic or confirm a source first.",
    path: ["topic"],
  });

export type GenerationRequest = z.infer<typeof generationRequestSchema>;
