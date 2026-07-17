import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the finished travel product", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>去野｜发现下一段值得记录的旅程<\/title>/);
  assert.match(html, /发现下一段/);
  assert.match(html, /灵感目的地/);
  assert.match(html, /智能行程/);
  assert.match(html, /我的收藏/);
  assert.match(html, /搜索想去的地方/);
  assert.match(html, /热门目的地/);
  assert.match(html, /loading="lazy"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("keeps responsive and accessible product contracts", async () => {
  const [page, css, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
  assert.match(page, /aria-current/);
  assert.match(page, /aria-describedby/);
  assert.match(page, /localStorage/);
  assert.match(page, /loading="lazy"/);
  assert.match(css, /max-width:\s*720px/);
  assert.match(css, /grid-template-columns:\s*repeat\(2/);
  assert.match(css, /grid-template-columns:\s*1fr/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /overflow-x:\s*hidden/);
  assert.match(layout, /metadataBase/);
  assert.match(layout, /og-v2\.png/);
  assert.match(packageJson, /"build": "vinext build"/);
});

test("wires real travel data and account persistence contracts", async () => {
  const [itinerary, weather, traffic, favorites, trips, schema, hosting, migration] = await Promise.all([
    readFile(new URL("../app/api/itinerary/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/weather/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/traffic/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/favorites/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/trips/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_typical_meteorite.sql", import.meta.url), "utf8"),
  ]);
  assert.match(itinerary, /api\.deepseek\.com\/chat\/completions/);
  assert.match(itinerary, /json_object/);
  assert.match(itinerary, /DEEPSEEK_API_KEY/);
  assert.match(itinerary, /世界各地的城市、国家、海岛、自然保护区、偏远地区、跨城路线/);
  assert.match(weather, /geocoding-api\.open-meteo\.com/);
  assert.match(weather, /大理市/);
  assert.match(traffic, /restapi\.amap\.com\/v5\/direction/);
  assert.match(traffic, /ROUTE_UNAVAILABLE/);
  assert.match(favorites, /getChatGPTUser/);
  assert.match(trips, /getChatGPTUser/);
  assert.match(schema, /sqliteTable\(\s*"favorites"/);
  assert.match(schema, /sqliteTable\("saved_trips"/);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(migration, /CREATE TABLE `favorites`/);
  assert.match(migration, /CREATE TABLE `saved_trips`/);
});
