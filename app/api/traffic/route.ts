import { errorMessage, fetchJson, runtimeValue } from "@/lib/api-utils";
import type { TrafficSummary } from "@/lib/travel-types";

type GeocodeResult = { location?: string; citycode?: string; adcode?: string };
type GeocodeResponse = { status?: string; info?: string; geocodes?: GeocodeResult[] };
type RoutePath = {
  distance?: string;
  duration?: string;
  cost?: { duration?: string };
  steps?: Array<{ instruction?: string; tmcs?: Array<{ status?: string }> }>;
  segments?: Array<{ walking?: { steps?: Array<{ instruction?: string }> }; bus?: { buslines?: Array<{ name?: string }> } }>;
};
type RouteResponse = {
  status?: string;
  info?: string;
  route?: { paths?: RoutePath[]; transits?: RoutePath[] };
};

async function geocode(key: string, city: string, address: string) {
  const url = new URL("https://restapi.amap.com/v3/geocode/geo");
  url.searchParams.set("key", key);
  url.searchParams.set("address", `${city}${address}`);
  url.searchParams.set("city", city);
  const response = await fetchJson<GeocodeResponse>(url.toString());
  const result = response.geocodes?.[0];
  if (response.status !== "1" || !result?.location) throw new Error(`无法定位“${address}”：${response.info || "未找到地点"}`);
  return result;
}

function seconds(value?: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(1, Math.round(parsed / 60)) : null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { city?: string; origin?: string; destination?: string; mode?: string };
    const city = body.city?.trim();
    const originText = body.origin?.trim();
    const destinationText = body.destination?.trim();
    if (!city || !originText || !destinationText) return Response.json({ error: "缺少交通查询地点" }, { status: 400 });
    const key = await runtimeValue("AMAP_WEB_SERVICE_KEY");
    if (!key) {
      return Response.json(
        { error: "实时交通尚未配置。请在站点环境变量中添加高德 Web 服务 Key。", code: "AMAP_NOT_CONFIGURED" },
        { status: 503 },
      );
    }

    const [origin, destination] = await Promise.all([geocode(key, city, originText), geocode(key, city, destinationText)]);
    const mode = body.mode || "公共交通";
    const endpoint = mode.includes("自驾") || mode.includes("包车")
      ? "driving"
      : mode.includes("骑行")
        ? "bicycling"
        : mode.includes("步行")
          ? "walking"
          : "transit/integrated";
    const url = new URL(`https://restapi.amap.com/v5/direction/${endpoint}`);
    url.searchParams.set("key", key);
    url.searchParams.set("origin", origin.location!);
    url.searchParams.set("destination", destination.location!);
    url.searchParams.set("show_fields", "cost,tmcs,navi");
    if (endpoint === "transit/integrated") {
      url.searchParams.set("city1", origin.citycode || origin.adcode || city);
      url.searchParams.set("city2", destination.citycode || destination.adcode || city);
    }
    const response = await fetchJson<RouteResponse>(url.toString());
    if (response.status !== "1") throw new Error(response.info || "高德未返回可用路线");
    const path = response.route?.paths?.[0] || response.route?.transits?.[0];
    if (!path) throw new Error("没有找到合适的交通路线");
    const tmcStatuses = path.steps?.flatMap((step) => step.tmcs?.map((item) => item.status).filter(Boolean) ?? []) ?? [];
    const instructions = [
      ...(path.steps?.map((step) => step.instruction).filter((item): item is string => Boolean(item)) ?? []),
      ...(path.segments?.flatMap((segment) => [
        ...(segment.walking?.steps?.map((step) => step.instruction).filter((item): item is string => Boolean(item)) ?? []),
        ...(segment.bus?.buslines?.map((line) => line.name).filter((item): item is string => Boolean(item)) ?? []),
      ]) ?? []),
    ].slice(0, 4);
    const distance = Number(path.distance);
    const summary: TrafficSummary = {
      mode,
      durationMinutes: seconds(path.cost?.duration || path.duration),
      distanceKilometers: Number.isFinite(distance) ? Math.round(distance / 100) / 10 : null,
      trafficStatus: tmcStatuses.includes("严重拥堵") ? "严重拥堵" : tmcStatuses.includes("拥堵") ? "部分拥堵" : tmcStatuses.includes("缓行") ? "局部缓行" : "路况正常",
      instructions,
      sourceUrl: "https://lbs.amap.com/api/webservice/guide/api/newroute",
    };
    return Response.json({ traffic: summary }, { headers: { "Cache-Control": "private, max-age=120" } });
  } catch (error) {
    const message = errorMessage(error, "交通数据暂时不可用");
    const routeUnavailable = /无法定位|未找到地点|没有找到合适|未返回可用路线/.test(message);
    return Response.json(
      routeUnavailable
        ? { error: "该地点暂未取得高德实时路线；海外或偏远地区请以当地地图与交通运营方为准。", code: "ROUTE_UNAVAILABLE" }
        : { error: message, code: "TRAFFIC_ERROR" },
      { status: routeUnavailable ? 422 : 502 },
    );
  }
}
