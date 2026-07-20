import { describe, expect, it } from "vitest";
import { privacyHash, signJson, verifySignedJson } from "@/lib/security/crypto";

const secret = "test-secret-with-more-than-thirty-two-characters";

describe("signed source tokens", () => {
  it("round-trips a scoped value", async () => {
    const token = await signJson({ title: "Planner" }, secret, "source-preview", 60);
    await expect(verifySignedJson<{ title: string }>(token, secret, "source-preview")).resolves.toEqual({ title: "Planner" });
  });

  it("rejects tampering, wrong scope, and expired values", async () => {
    const token = await signJson({ id: 1 }, secret, "source-preview", 60);
    await expect(verifySignedJson(`${token.slice(0, -1)}x`, secret, "source-preview")).rejects.toThrow();
    await expect(verifySignedJson(token, secret, "source-confirmed")).rejects.toThrow(/wrong purpose/iu);
    const expired = await signJson({ id: 1 }, secret, "source-preview", -1);
    await expect(verifySignedJson(expired, secret, "source-preview")).rejects.toThrow(/expired/iu);
  });

  it("creates stable privacy-preserving hashes", async () => {
    await expect(privacyHash("same subject", secret)).resolves.toBe(await privacyHash("same subject", secret));
    expect(await privacyHash("other subject", secret)).not.toBe(await privacyHash("same subject", secret));
  });
});
