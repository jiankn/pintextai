import { describe, expect, it } from "vitest";
import { extractSourceSnapshot } from "@/lib/source/extract";

describe("deterministic source extraction", () => {
  it("prefers Product JSON-LD and leaves volatile commerce facts out of details", () => {
    const html = `<!doctype html><html><head><title>Fallback</title><script type="application/ld+json">{
      "@context":"https://schema.org","@type":"Product","name":"Minimal Weekly Meal Planner",
      "description":"An undated printable planner for calmer family meal prep.",
      "image":"/planner.jpg","offers":{"price":"9.99","availability":"InStock"},
      "additionalProperty":[{"@type":"PropertyValue","name":"Format","value":"PDF"}]
    }</script></head><body><main><ul><li>Includes a reusable weekly planning layout</li></ul></main></body></html>`;
    const result = extractSourceSnapshot(html, "https://shop.example.com/planner");
    expect(result).toMatchObject({ type: "product", title: "Minimal Weekly Meal Planner" });
    expect(result.summary).toContain("undated printable");
    expect(result.details).toContain("Format: PDF");
    expect(result.details.join(" ")).not.toMatch(/9\.99|stock/iu);
    expect(result.imageUrl).toBe("https://shop.example.com/planner.jpg");
  });

  it("uses article metadata when JSON-LD is unavailable", () => {
    const html = `<html><head><meta property="og:type" content="article"><meta property="og:title" content="Grow Herbs on a Small Balcony"><meta name="description" content="A beginner guide to containers, light, watering, and useful culinary herbs."></head><body></body></html>`;
    const result = extractSourceSnapshot(html, "https://blog.example.com/herbs");
    expect(result.type).toBe("article");
    expect(result.title).toBe("Grow Herbs on a Small Balcony");
    expect(result.keywords.length).toBeGreaterThan(0);
  });
});
