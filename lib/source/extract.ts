import type { SourceSnapshot, SourceType } from "@/lib/source/schemas";

const stopwords = new Set([
  "about", "after", "again", "also", "and", "are", "best", "but", "can", "for", "from", "get", "has", "have",
  "how", "into", "its", "more", "new", "not", "our", "out", "page", "that", "the", "their", "this", "use", "was",
  "what", "when", "where", "which", "with", "your", "you",
]);

function decodeEntities(value: string) {
  const named: Record<string, string> = { amp: "&", apos: "'", gt: ">", lt: "<", nbsp: " ", quot: '"' };
  return value
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/giu, (_, entity: string) => {
      if (entity.startsWith("#x")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
      if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
      return named[entity.toLowerCase()] || " ";
    })
    .replace(/\s+/gu, " ")
    .trim();
}

function stripTags(value: string) {
  return decodeEntities(value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, " ").replace(/<[^>]+>/gu, " "));
}

function attributes(tag: string) {
  const result: Record<string, string> = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gu)) {
    result[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return result;
}

function metaContent(html: string, ...keys: string[]) {
  for (const tag of html.match(/<meta\b[^>]*>/giu) || []) {
    const attrs = attributes(tag);
    const key = (attrs.property || attrs.name || attrs.itemprop || "").toLowerCase();
    if (keys.map((item) => item.toLowerCase()).includes(key) && attrs.content) return attrs.content;
  }
  return "";
}

function firstImage(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return firstImage(value[0]);
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return typeof object.url === "string" ? object.url : typeof object.contentUrl === "string" ? object.contentUrl : undefined;
  }
  return undefined;
}

function jsonLdObjects(html: string) {
  const objects: Record<string, unknown>[] = [];
  const scripts = html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu);
  for (const match of scripts) {
    try {
      const parsed = JSON.parse(decodeEntities(match[1]).replace(/^\s*<!--|-->\s*$/gu, "")) as unknown;
      const queue: unknown[] = Array.isArray(parsed) ? [...parsed] : [parsed];
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item || typeof item !== "object" || Array.isArray(item)) continue;
        const object = item as Record<string, unknown>;
        objects.push(object);
        if (Array.isArray(object["@graph"])) queue.push(...object["@graph"]);
      }
    } catch {
      // Malformed JSON-LD is common; deterministic metadata fallbacks handle it.
    }
  }
  return objects;
}

function schemaTypes(object: Record<string, unknown>) {
  const value = object["@type"];
  return (Array.isArray(value) ? value : [value]).filter((item): item is string => typeof item === "string").map((item) => item.toLowerCase());
}

function text(value: unknown) {
  return typeof value === "string" ? decodeEntities(value) : "";
}

function collectDetails(object: Record<string, unknown> | undefined, html: string) {
  const details: string[] = [];
  if (object) {
    for (const key of ["features", "featureList", "award", "slogan"]) {
      const value = object[key];
      if (typeof value === "string") details.push(...value.split(/[\n•|]/u));
      if (Array.isArray(value)) details.push(...value.filter((item): item is string => typeof item === "string"));
    }
    if (Array.isArray(object.additionalProperty)) {
      for (const property of object.additionalProperty) {
        if (!property || typeof property !== "object") continue;
        const item = property as Record<string, unknown>;
        const name = text(item.name);
        const value = text(item.value);
        if (name && value) details.push(`${name}: ${value}`);
      }
    }
  }
  if (details.length < 3) {
    const listItems = [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/giu)]
      .map((match) => stripTags(match[1]))
      .filter((item) => item.length >= 18 && item.length <= 220);
    details.push(...listItems.slice(0, 6));
  }
  return [...new Set(details.map((item) => decodeEntities(item)).filter((item) => item.length >= 4 && item.length <= 300))].slice(0, 6);
}

function suggestedKeywords(title: string, summary: string) {
  const words = `${title} ${summary}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gu, " ")
    .split(/\s+/u)
    .filter((word) => word.length >= 4 && !stopwords.has(word));
  const counts = new Map<string, number>();
  for (const word of words) counts.set(word, (counts.get(word) || 0) + 1);
  const singles = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([word]) => word);
  const titleWords = title.toLowerCase().replace(/[^a-z0-9\s-]/gu, " ").split(/\s+/u).filter((word) => word.length >= 4 && !stopwords.has(word));
  const phrases = titleWords.slice(0, 6).map((word, index) => (index < titleWords.length - 1 ? `${word} ${titleWords[index + 1]}` : word));
  return [...new Set([...phrases, ...singles])].slice(0, 8);
}

export function extractSourceSnapshot(html: string, finalUrl: string): SourceSnapshot {
  const objects = jsonLdObjects(html);
  const product = objects.find((object) => schemaTypes(object).includes("product"));
  const article = objects.find((object) => schemaTypes(object).some((type) => ["article", "blogposting", "newsarticle", "recipe", "howto"].includes(type)));
  const chosen = product || article;

  const ogType = metaContent(html, "og:type").toLowerCase();
  let type: SourceType = product ? "product" : article || ogType.includes("article") ? "article" : "landing";
  if (type === "landing" && /add to cart|buy now|product:price|shop now/iu.test(html.slice(0, 300_000))) type = "product";

  const htmlTitle = stripTags(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/iu)?.[1] || "");
  const title = text(chosen?.name || chosen?.headline) || metaContent(html, "og:title", "twitter:title") || htmlTitle;
  const summary =
    text(chosen?.description || chosen?.abstract) ||
    metaContent(html, "description", "og:description", "twitter:description") ||
    stripTags(html.match(/<(?:main|article)\b[^>]*>([\s\S]{80,6000}?)<\/(?:main|article)>/iu)?.[1] || "").slice(0, 1200);
  const image = firstImage(chosen?.image) || metaContent(html, "og:image", "twitter:image");

  if (title.length < 2 || summary.length < 2) throw new Error("We found the page, but it did not expose enough title and summary information.");
  let imageUrl: string | undefined;
  if (image) {
    try {
      imageUrl = new URL(image, finalUrl).toString();
    } catch {
      imageUrl = undefined;
    }
  }

  return {
    type,
    url: finalUrl,
    title: title.slice(0, 300),
    summary: summary.slice(0, 1800),
    details: collectDetails(chosen, html),
    keywords: suggestedKeywords(title, summary),
    imageUrl,
  };
}
