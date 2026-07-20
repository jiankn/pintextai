import { describe, expect, it } from "vitest";
import { isPrivateIp, validateSourceUrl } from "@/lib/source/validate-url";
import { assertSameOrigin } from "@/lib/security/request";

describe("source URL security", () => {
  it.each(["127.0.0.1", "10.0.0.8", "172.20.4.2", "192.168.1.1", "169.254.169.254", "::1", "fd00::4", "fe80::1", "::ffff:127.0.0.1"])("classifies %s as private", (address) => {
    expect(isPrivateIp(address)).toBe(true);
  });

  it.each([
    "http://localhost/admin",
    "https://user:pass@example.com/private",
    "http://10.0.0.1/catalog",
    "https://example.com:8443/item",
    "file:///etc/passwd",
    "https://www.pinterest.com/pin/123",
    "https://pin.it/example",
  ])("rejects unsafe input %s", (url) => {
    expect(() => validateSourceUrl(url)).toThrow();
  });

  it("accepts a normal public product page URL", () => {
    expect(validateSourceUrl("https://shop.example.com/products/planner?color=red").hostname).toBe("shop.example.com");
  });

  it("rejects cross-origin writes while allowing local preview ports", () => {
    expect(() => assertSameOrigin(new Request("https://pintextai.com/api/test", { headers: { origin: "https://evil.example" } }), "https://pintextai.com")).toThrow(/untrusted origin/iu);
    expect(() => assertSameOrigin(new Request("http://127.0.0.1:8787/api/test", { headers: { origin: "http://127.0.0.1:8787" } }), "http://localhost:3000")).not.toThrow();
  });
});
