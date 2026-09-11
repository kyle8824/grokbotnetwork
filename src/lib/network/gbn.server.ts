import type { StoryFrame, StorySource } from "@/lib/types";
import { storyIdFromSlug } from "./ids";
import { FALLBACK_STORIES, type SeedStory } from "./seed-data";

const GBN_ORIGIN = "https://www.grokbotnews.com";
const UA = "GrokBotNetwork/1.0 (AgentWire; publisher-node ingest)";

export type IngestedStory = {
  id: string;
  slug: string;
  title: string;
  url: string;
  source: StorySource;
  topic: string;
  summary: string;
  kicker: string;
  frames: StoryFrame[];
  updatedAt: string;
  isFallback: boolean;
};

function decode(html: string): string {
  return html
    .replace(/&/g, "&")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/'/g, "'")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/g, " ")
    .trim();
}

function stripTags(html: string): string {
  return decode(html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

async function fetchText(url: string, timeoutMs = 12000): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "user-agent": UA, accept: "text/html,application/xml,text/xml,application/json" },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function extractJsonLd(html: string): Record<string, unknown> | null {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  for (const m of blocks) {
    try {
      const parsed = JSON.parse(m[1] ?? "") as unknown;
      if (parsed && typeof parsed === "object") {
        const obj = parsed as Record<string, unknown>;
        if (obj["@type"] === "NewsArticle" || obj.headline) return obj;
      }
    } catch {
      /* continue */
    }
  }
  return null;
}

function attr(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const m = html.match(re);
  if (m?.[1]) return decode(m[1]);
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["']`,
    "i",
  );
  const m2 = html.match(re2);
  return m2?.[1] ? decode(m2[1]) : null;
}

function inner(html: string, cls: string): string | null {
  const re = new RegExp(`class=["'][^"']*\\b${cls}\\b[^"']*["'][^>]*>([\\s\\S]*?)</`, "i");
  const m = html.match(re);
  return m?.[1] ? stripTags(m[1]) : null;
}

function parseFrames(html: string): StoryFrame[] {
  const frames: StoryFrame[] = [];
  const frameBlocks = [...html.matchAll(/<div class="frame ([^"]+)">([\s\S]*?)<\/div>/gi)];
  for (const block of frameBlocks) {
    const cls = block[1] ?? "";
    const body = block[2] ?? "";
    const heading = stripTags((body.match(/<h3>([\s\S]*?)<\/h3>/i) ?? [])[1] ?? "");
    const p = stripTags((body.match(/<p>([\s\S]*?)<\/p>/i) ?? [])[1] ?? "");
    const sources: { label: string; url: string }[] = [];
    const srcBlock = body.match(/class="sources"[\s\S]*?<\/p>/i)?.[0] ?? "";
    for (const a of srcBlock.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
      sources.push({ url: decode(a[1] ?? ""), label: stripTags(a[2] ?? "") });
    }
    const side: StoryFrame["side"] = cls.includes("cl")
      ? "center-left"
      : cls.includes("cr")
        ? "center-right"
        : "other";
    if (heading || p) frames.push({ side, heading, body: p, sources });
  }
  return frames;
}

function slugFromUrl(url: string): string | null {
  const m = url.match(/\/stories\/([a-z0-9-]+)/i);
  return m?.[1] ?? null;
}

function parseSitemap(xml: string): { loc: string; lastmod: string | null }[] {
  const out: { loc: string; lastmod: string | null }[] = [];
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
    const block = m[1] ?? "";
    const loc = (block.match(/<loc>([^<]+)<\/loc>/i) ?? [])[1];
    const lastmod = (block.match(/<lastmod>([^<]+)<\/lastmod>/i) ?? [])[1] ?? null;
    if (loc?.includes("/stories/")) out.push({ loc: loc.trim(), lastmod });
  }
  return out;
}

function seedToIngested(s: SeedStory, fallback: boolean): IngestedStory {
  return {
    id: storyIdFromSlug(s.slug),
    slug: s.slug,
    title: s.title,
    url: s.url,
    source: "grokbotnews",
    topic: s.topic,
    summary: s.summary,
    kicker: s.kicker,
    frames: [],
    updatedAt: s.updatedAt,
    isFallback: fallback,
  };
}

export function fallbackStories(): IngestedStory[] {
  return FALLBACK_STORIES.map((s) => seedToIngested(s, true));
}

function parseStoryHtml(html: string, url: string, lastmod: string | null): IngestedStory | null {
  const slug = slugFromUrl(url);
  if (!slug) return null;
  const ld = extractJsonLd(html);
  const title =
    (typeof ld?.headline === "string" ? ld.headline : null) ||
    inner(html, "lead-hed") ||
    attr(html, "og:title")?.replace(/\s+—\s+GROK BOT NEWS$/i, "") ||
    "";
  const summary =
    inner(html, "dek") ||
    (typeof ld?.description === "string" ? ld.description : null) ||
    attr(html, "og:description") ||
    "";
  const topic =
    inner(html, "cat-kicker") ||
    (typeof ld?.articleSection === "string" ? String(ld.articleSection).toUpperCase() : null) ||
    "";
  const kicker = inner(html, "stamp") || "";
  const updatedAt =
    (typeof ld?.dateModified === "string" ? ld.dateModified : null) ||
    (typeof ld?.datePublished === "string" ? ld.datePublished : null) ||
    lastmod ||
    new Date().toISOString();
  if (!title) return null;
  return {
    id: storyIdFromSlug(slug),
    slug,
    title: stripTags(title),
    url,
    source: "grokbotnews",
    topic: stripTags(topic).toUpperCase() || "NEWS",
    summary: stripTags(summary),
    kicker: stripTags(kicker),
    frames: parseFrames(html),
    updatedAt,
    isFallback: false,
  };
}

async function mapPool<T, R>(items: T[], n: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx] as T);
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, () => worker()));
  return out;
}

export async function ingestGrokBotNews(): Promise<{
  stories: IngestedStory[];
  fromLive: boolean;
  error?: string;
}> {
  const sitemap = await fetchText(`${GBN_ORIGIN}/sitemap.xml`);
  const listed = sitemap ? parseSitemap(sitemap) : [];
  const urls = listed.length
    ? listed
    : FALLBACK_STORIES.map((s) => ({ loc: s.url, lastmod: s.updatedAt }));

  const pages = await mapPool(urls.slice(0, 28), 5, async (u) => {
    const html = await fetchText(u.loc);
    if (!html) return null;
    return parseStoryHtml(html, u.loc, u.lastmod);
  });

  const live = pages.filter((s): s is IngestedStory => Boolean(s));
  if (live.length >= 4) {
    return { stories: live, fromLive: true };
  }

  const bySlug = new Map(live.map((s) => [s.slug, s]));
  const merged = fallbackStories().map((s) => bySlug.get(s.slug) ?? s);
  for (const s of live) {
    if (!merged.some((m) => m.slug === s.slug)) merged.push(s);
  }
  return {
    stories: merged,
    fromLive: live.length > 0,
    error: live.length ? "partial ingest; filled from cache seeds" : "GBN unreachable; using seeded story cache",
  };
}
