import { assertPublicDns, validateSourceUrl } from "@/lib/source/validate-url";

const MAX_BYTES = 1_000_000;
const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 4000;

async function readLimitedText(response: Response) {
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_BYTES) throw new Error("This page is too large to preview safely.");
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      await reader.cancel();
      throw new Error("This page is too large to preview safely.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export async function fetchSourcePage(input: string) {
  const started = Date.now();
  let current = validateSourceUrl(input);

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    await assertPublicDns(current);
    const remaining = TIMEOUT_MS - (Date.now() - started);
    if (remaining <= 0) throw new Error("The source page took too long to respond.");
    const response = await fetch(current, {
      method: "GET",
      redirect: "manual",
      headers: {
        accept: "text/html,application/xhtml+xml;q=0.9",
        "user-agent": "PinTextAI-SourcePreview/1.0 (+https://pintextai.com/contact)",
      },
      signal: AbortSignal.timeout(remaining),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("The source returned an invalid redirect.");
      if (redirect === MAX_REDIRECTS) throw new Error("The source redirected too many times.");
      current = validateSourceUrl(new URL(location, current).toString());
      continue;
    }
    if (!response.ok) throw new Error(`The source page returned HTTP ${response.status}.`);
    const contentType = response.headers.get("content-type")?.toLowerCase() || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      throw new Error("Only public HTML product, article, and landing pages can be previewed.");
    }
    const html = await readLimitedText(response);
    if (html.length < 80) throw new Error("The source page did not contain enough readable information.");
    return { html, finalUrl: current.toString(), elapsedMs: Date.now() - started };
  }
  throw new Error("The source could not be loaded.");
}
