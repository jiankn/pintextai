const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function base64UrlToBytes(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  if (bytesToBase64Url(bytes) !== value) throw new Error("The source confirmation is invalid.");
  return bytes;
}

async function importHmacKey(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

type SignedEnvelope<T> = { exp: number; scope: string; nonce: string; value: T };

export async function signJson<T>(value: T, secret: string, scope: string, ttlSeconds: number) {
  const envelope: SignedEnvelope<T> = {
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    scope,
    nonce: crypto.randomUUID(),
    value,
  };
  const payload = bytesToBase64Url(encoder.encode(JSON.stringify(envelope)));
  const signature = await crypto.subtle.sign("HMAC", await importHmacKey(secret), encoder.encode(payload));
  return `${payload}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

export async function verifySignedJson<T>(token: string, secret: string, expectedScope: string): Promise<T> {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) throw new Error("The source confirmation is invalid.");
  const valid = await crypto.subtle.verify(
    "HMAC",
    await importHmacKey(secret),
    base64UrlToBytes(signature),
    encoder.encode(payload),
  );
  if (!valid) throw new Error("The source confirmation was changed or is invalid.");
  const envelope = JSON.parse(decoder.decode(base64UrlToBytes(payload))) as SignedEnvelope<T>;
  if (envelope.scope !== expectedScope) throw new Error("The source confirmation has the wrong purpose.");
  if (!Number.isFinite(envelope.exp) || envelope.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("The source preview expired. Preview the page again.");
  }
  return envelope.value;
}

export async function privacyHash(value: string, secret: string) {
  const signature = await crypto.subtle.sign("HMAC", await importHmacKey(secret), encoder.encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}
