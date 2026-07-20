import { describe, expect, it } from "vitest";
import { createDemoResults } from "@/lib/ai/demo";
import { buildPrompt } from "@/lib/ai/prompts";
import { validateGeneratedResults } from "@/lib/ai/quality";
import { GENERATOR_TYPES, type GeneratorType } from "@/lib/product";

function request(type: GeneratorType) {
  return { requestId: crypto.randomUUID(), type, topic: "Minimal weekly meal planner printable", goal: "Drive sales" as const, vibe: "Natural" as const, cta: "Auto" as const };
}

describe("generation contract", () => {
  it.each(GENERATOR_TYPES)("creates exactly ten unique demo %s results", (type) => {
    const results = createDemoResults(request(type));
    expect(results).toHaveLength(10);
    expect(new Set(results.map((item) => item.text.toLowerCase())).size).toBe(10);
    expect(() => validateGeneratedResults({ items: results })).not.toThrow();
  });

  it("grounds prompts in confirmed facts and server-side brand guidance", () => {
    const prompt = buildPrompt(request("description"), { type: "product", url: "https://shop.example.com/planner", title: "Meal Planner", summary: "Undated PDF for busy households", details: ["Format: PDF"], keywords: ["meal planner"] }, { name: "Northlight", audience: "Busy parents", voice: "Warm and practical", defaultCta: "Explore the planner", bannedTerms: ["guaranteed"], keywords: ["family planning"] });
    expect(prompt.instructions).toContain("Use only facts");
    expect(prompt.instructions).toContain("Never use these brand-banned terms: guaranteed");
    expect(prompt.input).toContain("Undated PDF for busy households");
    expect(prompt.input).toContain("Warm and practical");
  });

  it("rejects repetitive model output", () => {
    const duplicate = { text: "Same output", keyword: "", angle: "same" };
    expect(() => validateGeneratedResults({ items: Array.from({ length: 10 }, () => duplicate) })).toThrow(/repetitive/iu);
  });
});
