import type { GenerationRequest } from "@/lib/ai/schemas";
import type { SourceSnapshot } from "@/lib/source/schemas";

const rules = {
  title: "Write concise Pinterest Pin titles. Make each opening and content angle distinct. Prefer clarity over clickbait.",
  description: "Write useful Pinterest descriptions with natural keywords, concrete value, and a fitting call to action. Avoid keyword stuffing.",
  caption: "Write concise Pinterest captions that sound human, match the selected vibe, and make the next action clear without sounding spammy.",
  hashtag: "Write 10 relevant hashtag sets. Each result should contain 5-8 specific hashtags, avoid near-duplicates, and never claim they are real-time trends.",
} satisfies Record<GenerationRequest["type"], string>;

export const PROMPT_VERSION = "pin-copy.v1";

export type BrandContext = {
  name: string;
  audience: string;
  voice: string;
  defaultCta: string;
  bannedTerms: string[];
  keywords: string[];
};

export function buildPrompt(input: GenerationRequest, source?: SourceSnapshot, brand?: BrandContext) {
  const sourceContext = source
    ? JSON.stringify({
        type: source.type,
        title: source.title,
        summary: source.summary,
        details: source.details,
        suggestedKeywords: source.keywords,
      })
    : JSON.stringify({ type: "manual", topic: input.topic });

  return {
    instructions: [
      "You are PinTextAI, a Pinterest copy specialist for sellers, bloggers, small ecommerce teams, and marketing professionals.",
      rules[input.type],
      "Use only facts present in SOURCE_CONTEXT and explicit USER_SETTINGS.",
      "Never invent prices, discounts, stock, ratings, sales volume, scarcity, awards, endorsements, or brand relationships.",
      "Keep all 10 options meaningfully different in opening, structure, and emphasis.",
      brand?.bannedTerms.length ? `Never use these brand-banned terms: ${brand.bannedTerms.join(", ")}.` : "",
      "Return English copy. Do not add explanations outside the requested structured result.",
    ].filter(Boolean).join("\n"),
    input: [
      `OUTPUT_TYPE: ${input.type}`,
      `SOURCE_CONTEXT: ${sourceContext}`,
      `USER_SETTINGS: ${JSON.stringify({ goal: input.goal, vibe: input.vibe, angle: input.angle, keyword: input.keyword, audience: input.audience, cta: input.cta })}`,
      `BRAND_PROFILE: ${brand ? JSON.stringify(brand) : "none"}`,
      "Create exactly 10 editable options. Set each item's keyword to the target keyword actually used, or an empty string. Set angle to the distinct angle used.",
    ].join("\n"),
  };
}
