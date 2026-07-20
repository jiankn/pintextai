import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { generatedResultsSchema, type GeneratedResults, type GenerationRequest } from "@/lib/ai/schemas";
import { createDemoResults } from "@/lib/ai/demo";
import { buildPrompt, type BrandContext } from "@/lib/ai/prompts";
import { validateGeneratedResults } from "@/lib/ai/quality";
import type { AppEnv } from "@/lib/cloudflare";
import type { SourceSnapshot } from "@/lib/source/schemas";

export type AiGeneration = {
  results: GeneratedResults;
  mode: "live" | "demo";
  model: string;
  inputTokens: number;
  outputTokens: number;
};

export async function generatePinCopy(input: GenerationRequest, source: SourceSnapshot | undefined, env: AppEnv, safetyIdentifier: string, brand?: BrandContext): Promise<AiGeneration> {
  const model = env.OPENAI_MODEL || "gpt-5.6-luna";
  if (!env.OPENAI_API_KEY) {
    return {
      results: validateGeneratedResults({ items: createDemoResults(input, source) }),
      mode: "demo",
      model: "deterministic-demo",
      inputTokens: 0,
      outputTokens: 0,
    };
  }
  if (env.AI_BUDGET_MODE === "closed") throw new Error("AI generation is temporarily paused by the account budget guard.");

  const client = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: env.AI_GATEWAY_BASE_URL || undefined,
    maxRetries: 1,
    timeout: 7500,
  });
  const prompt = buildPrompt(input, source, brand);
  const response = await client.responses.parse({
    model,
    store: false,
    safety_identifier: safetyIdentifier,
    reasoning: { effort: "low" },
    instructions: prompt.instructions,
    input: prompt.input,
    max_output_tokens: 3500,
    text: { format: zodTextFormat(generatedResultsSchema, "pin_copy_results") },
  });
  if (!response.output_parsed) throw new Error("The AI response did not contain usable structured results.");

  return {
    results: validateGeneratedResults(response.output_parsed),
    mode: "live",
    model,
    inputTokens: response.usage?.input_tokens || 0,
    outputTokens: response.usage?.output_tokens || 0,
  };
}
