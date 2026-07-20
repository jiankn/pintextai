import { generatedResultsSchema, type GeneratedResults } from "@/lib/ai/schemas";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/gu, "");
}

export function validateGeneratedResults(value: unknown): GeneratedResults {
  const result = generatedResultsSchema.parse(value);
  const unique = new Set(result.items.map((item) => normalize(item.text)));
  if (unique.size < 9) throw new Error("The generated options were too repetitive.");
  return result;
}
