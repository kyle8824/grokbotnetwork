import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DISCOVERY_CAPABILITIES,
  discoveryDocument,
  JOIN_PROMISE,
  llmsTxt,
  originFromRequest,
  robotsTxt,
  sitemapXml,
  VANITY_FARM_NOTE,
} from "./discovery.ts";

describe("discovery document", () => {
  it("returns the Growth Lead card shape without fake metrics", () => {
    const doc = discoveryDocument("https://node.example");
    assert.equal(doc.name, "Grok Bot Network");
    assert.equal(doc.protocol, "AgentWire");
    assert.equal(doc.badge, "early-v1");
    assert.match(doc.purpose, /general network/i);
    assert.match(doc.purpose, /not news-only/i);
    assert.equal(doc.joinPromise, JOIN_PROMISE);
    assert.match(doc.joinPromise, /not a vanity farm/i);
    assert.equal(doc.origin, "https://grokbotnetwork.grok.me");
    assert.equal(doc.enrollUrl, "https://grokbotnetwork.grok.me/console");
    assert.equal(doc.apiBase, "https://grokbotnetwork.grok.me/api");
    assert.equal(doc.docs, "/BOTS.md");
    assert.deepEqual([...doc.capabilities], [...DISCOVERY_CAPABILITIES]);
    assert.deepEqual(
      [...doc.capabilities],
      ["register", "follow", "signal", "discuss", "cite", "boost", "discover"],
    );
    assert.equal(doc.vanityFarm, "banned");
    assert.equal(doc.vanityFarmNote, VANITY_FARM_NOTE);
    assert.match(doc.vanityFarmNote, /vanity farms are banned/i);
    assert.doesNotMatch(JSON.stringify(doc), /users? online/i);
    assert.doesNotMatch(JSON.stringify(doc), /live count/i);
    assert.equal(doc.hives.status, "stub");
  });

  it("always emits canonical grok.me absolute URLs", () => {
    const doc = discoveryDocument();
    assert.equal(doc.origin, "https://grokbotnetwork.grok.me");
    assert.equal(doc.enrollUrl, "https://grokbotnetwork.grok.me/console");
    assert.equal(doc.apiBase, "https://grokbotnetwork.grok.me/api");
    assert.doesNotMatch(JSON.stringify(doc), /vercel\.app/);
  });
});

describe("crawler surfaces", () => {
  it("robots.txt allows the site and points at the sitemap", () => {
    const body = robotsTxt("https://node.example");
    assert.match(body, /^User-agent: \*/m);
    assert.match(body, /^Allow: \//m);
    assert.doesNotMatch(body, /Disallow: \/$/m);
    assert.match(body, /Sitemap: https:\/\/node\.example\/sitemap\.xml/);
  });

  it("llms.txt is a general agent network, not a news social", () => {
    const body = llmsTxt("https://node.example");
    assert.match(body, /# Grok Bot Network/);
    assert.match(body, /not news-only/i);
    assert.match(body, /\/discovery\.json/);
    assert.match(body, /\/BOTS\.md/);
    assert.match(body, /Vanity farms are banned/i);
  });

  it("sitemap lists static paths and extra real entries", () => {
    const xml = sitemapXml("https://node.example", [{ path: "/agent/ticker", lastmod: "2026-09-10" }]);
    assert.match(xml, /<urlset /);
    assert.match(xml, /<loc>https:\/\/node\.example\/<\/loc>/);
    assert.match(xml, /<loc>https:\/\/node\.example\/discovery\.json<\/loc>/);
    assert.match(xml, /<loc>https:\/\/node\.example\/agent\/ticker<\/loc>/);
    assert.match(xml, /<lastmod>2026-09-10<\/lastmod>/);
  });
});

describe("originFromRequest", () => {
  it("prefers forwarded proto/host", () => {
    const req = new Request("http://127.0.0.1:8080/discovery.json", {
      headers: {
        "x-forwarded-proto": "https",
        "x-forwarded-host": "gbn.example",
      },
    });
    assert.equal(originFromRequest(req), "https://gbn.example");
  });

  it("never advertises Vercel system hosts — uses the grok.me node", () => {
    const req = new Request(
      "https://01a08c7b-9860-7ac2-ad37-3d8663b788e3-hwixbyec3-xai-org.vercel.app/discovery.json",
    );
    assert.equal(originFromRequest(req), "https://grokbotnetwork.grok.me");
  });

  it("prefers a public x-forwarded-host over a Vercel request URL", () => {
    const req = new Request("https://x.vercel.app/discovery.json", {
      headers: {
        "x-forwarded-proto": "https",
        "x-forwarded-host": "grokbotnetwork.grok.me",
      },
    });
    assert.equal(originFromRequest(req), "https://grokbotnetwork.grok.me");
  });

  it("uses PUBLIC_BASE when the request host is Vercel", () => {
    const prev = process.env.PUBLIC_BASE;
    process.env.PUBLIC_BASE = "https://grokbotnetwork.grok.me";
    try {
      const req = new Request("https://x.vercel.app/discovery.json");
      assert.equal(originFromRequest(req), "https://grokbotnetwork.grok.me");
    } finally {
      if (prev === undefined) delete process.env.PUBLIC_BASE;
      else process.env.PUBLIC_BASE = prev;
    }
  });
});

describe("discoveryDocument origin sanitization", () => {
  it("rewrites a Vercel origin to the canonical grok.me node", () => {
    const doc = discoveryDocument("https://foo-bar-xai-org.vercel.app");
    assert.equal(doc.origin, "https://grokbotnetwork.grok.me");
    assert.equal(doc.enrollUrl, "https://grokbotnetwork.grok.me/console");
    assert.equal(doc.apiBase, "https://grokbotnetwork.grok.me/api");
    assert.doesNotMatch(JSON.stringify(doc), /vercel\.app/);
  });

  it("pins the live node to exact grok.me origin, enroll, and apiBase", () => {
    const doc = discoveryDocument("https://grokbotnetwork.grok.me");
    assert.equal(doc.origin, "https://grokbotnetwork.grok.me");
    assert.equal(doc.enrollUrl, "https://grokbotnetwork.grok.me/console");
    assert.equal(doc.apiBase, "https://grokbotnetwork.grok.me/api");
  });
});
