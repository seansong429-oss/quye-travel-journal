import { errorMessage, fetchJson } from "@/lib/api-utils";
import type { DestinationDetail } from "@/lib/travel-types";

const titles: Record<string, string> = {
  dali: "大理市", kyoto: "京都市", iceland: "冰岛", chiangmai: "清迈", amami: "奄美大岛", lisbon: "里斯本",
};
type WikiResponse = {
  query?: { pages?: Record<string, { title?: string; extract?: string; fullurl?: string; touched?: string; thumbnail?: { source?: string } }> };
};

export async function GET(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id") || "";
    const title = titles[id];
    if (!title) return Response.json({ error: "未知目的地" }, { status: 404 });
    const wikiUrl = new URL("https://zh.wikipedia.org/w/api.php");
    wikiUrl.searchParams.set("action", "query");
    wikiUrl.searchParams.set("prop", "extracts|pageimages|info");
    wikiUrl.searchParams.set("exintro", "1");
    wikiUrl.searchParams.set("explaintext", "1");
    wikiUrl.searchParams.set("inprop", "url");
    wikiUrl.searchParams.set("piprop", "thumbnail");
    wikiUrl.searchParams.set("pithumbsize", "1200");
    wikiUrl.searchParams.set("redirects", "1");
    wikiUrl.searchParams.set("format", "json");
    wikiUrl.searchParams.set("origin", "*");
    wikiUrl.searchParams.set("titles", title);
    const response = await fetchJson<WikiResponse>(wikiUrl.toString(), { headers: { "User-Agent": "QuyeTravelJournal/1.0" } });
    const page = Object.values(response.query?.pages ?? {})[0];
    if (!page?.extract || !page.fullurl) throw new Error("百科没有返回可用的目的地资料");
    const detail: DestinationDetail = {
      title: page.title || title,
      description: "正式目的地资料 · 中文维基百科",
      extract: page.extract.slice(0, 650),
      image: page.thumbnail?.source || null,
      sourceUrl: page.fullurl,
      lastUpdated: page.touched || null,
    };
    return Response.json({ detail }, { headers: { "Cache-Control": "public, max-age=21600" } });
  } catch (error) {
    return Response.json({ error: errorMessage(error, "目的地资料暂时不可用") }, { status: 502 });
  }
}
