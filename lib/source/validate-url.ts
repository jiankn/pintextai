const forbiddenHostnames = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.goog",
  "instance-data",
  "169.254.169.254",
]);

const safePorts = new Set(["", "80", "443"]);

function parseIpv4(value: string) {
  const parts = value.split(".");
  if (parts.length !== 4) return null;
  const numbers = parts.map(Number);
  if (numbers.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return null;
  return numbers;
}

export function isPrivateIp(value: string) {
  const normalized = value.toLowerCase().replace(/^\[|\]$/gu, "");
  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/u)?.[1];
  const ipv4 = parseIpv4(mapped || normalized);
  if (ipv4) {
    const [a, b] = ipv4;
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 0 || b === 168)) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  if (!normalized.includes(":")) return false;
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    /^fe[89ab]/u.test(normalized) ||
    normalized.startsWith("ff")
  );
}

export function validateSourceUrl(input: string) {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("Enter a complete public URL beginning with http:// or https://.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Only public http:// and https:// URLs are supported.");
  if (url.username || url.password) throw new Error("URLs containing a username or password are not supported.");
  if (!safePorts.has(url.port)) throw new Error("This URL uses a network port that is not supported.");
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/gu, "").replace(/\.$/u, "");
  if (
    forbiddenHostnames.has(hostname) ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".home.arpa") ||
    isPrivateIp(hostname)
  ) {
    throw new Error("Private, local, and metadata network addresses are blocked.");
  }
  if (hostname === "pinterest.com" || hostname.endsWith(".pinterest.com") || hostname === "pin.it") {
    throw new Error("Pinterest profile, Board, and Pin URLs are not supported. Use your own product, article, or landing page instead.");
  }
  return url;
}

type DnsAnswer = { data: string; type: number };
type DnsResponse = { Status?: number; Answer?: DnsAnswer[] };

async function resolveDns(hostname: string, type: "A" | "AAAA") {
  const endpoint = new URL("https://cloudflare-dns.com/dns-query");
  endpoint.searchParams.set("name", hostname);
  endpoint.searchParams.set("type", type);
  const response = await fetch(endpoint, {
    headers: { accept: "application/dns-json" },
    signal: AbortSignal.timeout(2000),
  });
  if (!response.ok) throw new Error("The source host could not be verified safely.");
  const data = (await response.json()) as DnsResponse;
  return (data.Answer || []).filter((answer) => answer.type === (type === "A" ? 1 : 28)).map((answer) => answer.data);
}

export async function assertPublicDns(url: URL) {
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/gu, "");
  if (parseIpv4(hostname) || hostname.includes(":")) {
    if (isPrivateIp(hostname)) throw new Error("Private network destinations are blocked.");
    return;
  }
  const [ipv4, ipv6] = await Promise.all([resolveDns(hostname, "A"), resolveDns(hostname, "AAAA")]);
  const addresses = [...ipv4, ...ipv6];
  if (addresses.length === 0) throw new Error("The source host does not have a public DNS address.");
  if (addresses.some(isPrivateIp)) throw new Error("The source host resolves to a blocked private network address.");
}
