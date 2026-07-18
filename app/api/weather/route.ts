import { errorMessage, fetchJson } from "@/lib/api-utils";
import type { WeatherDay, WeatherSummary } from "@/lib/travel-types";

type GeocodingResponse = {
  results?: Array<{ name: string; country?: string; admin1?: string; latitude: number; longitude: number; timezone?: string }>;
};
type ForecastResponse = {
  timezone: string;
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
  };
};

const weatherLabels: Record<number, string> = {
  0: "晴朗", 1: "大致晴朗", 2: "局部多云", 3: "阴天", 45: "有雾", 48: "雾凇",
  51: "小毛毛雨", 53: "毛毛雨", 55: "较强毛毛雨", 56: "冻毛毛雨", 57: "强冻毛毛雨",
  61: "小雨", 63: "中雨", 65: "大雨", 66: "冻雨", 67: "强冻雨", 71: "小雪", 73: "中雪", 75: "大雪", 77: "米雪",
  80: "小阵雨", 81: "阵雨", 82: "强阵雨", 85: "小阵雪", 86: "强阵雪", 95: "雷雨", 96: "雷雨伴小冰雹", 99: "强雷雨伴冰雹",
};

const weatherSearchAliases: Record<string, string> = {
  大理: "大理市",
  京都: "Kyoto",
  冰岛: "Reykjavik",
  清迈: "Chiang Mai",
  奄美大岛: "Amami",
  里斯本: "Lisbon",
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const destination = url.searchParams.get("destination")?.trim();
    const startDate = url.searchParams.get("date")?.trim();
    const days = Math.min(Math.max(Number(url.searchParams.get("days") || 5), 1), 14);
    if (!destination) return Response.json({ error: "缺少目的地" }, { status: 400 });

    const searchName = weatherSearchAliases[destination] ?? destination;
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchName)}&count=1&language=zh&format=json`;
    const geocoding = await fetchJson<GeocodingResponse>(geocodingUrl);
    const location = geocoding.results?.[0];
    if (!location) return Response.json({ error: `未找到“${destination}”的天气位置` }, { status: 404 });

    const today = new Date().toISOString().slice(0, 10);
    const requestedDate = startDate || today;
    const diffDays = Math.round((Date.parse(`${requestedDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
    const withinForecast = diffDays >= 0 && diffDays <= 15;
    const forecastDays = Math.min(Math.max(diffDays + days, days), 16);
    const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
    forecastUrl.searchParams.set("latitude", String(location.latitude));
    forecastUrl.searchParams.set("longitude", String(location.longitude));
    forecastUrl.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max");
    forecastUrl.searchParams.set("timezone", "auto");
    forecastUrl.searchParams.set("forecast_days", String(forecastDays));
    const forecast = await fetchJson<ForecastResponse>(forecastUrl.toString());
    const daily = forecast.daily;
    if (!daily) throw new Error("天气服务没有返回逐日预报");

    const startIndex = withinForecast ? Math.max(diffDays, 0) : 0;
    const resultDays: WeatherDay[] = daily.time.slice(startIndex, startIndex + days).map((date, index) => {
      const sourceIndex = startIndex + index;
      const code = daily.weather_code[sourceIndex] ?? -1;
      return {
        date,
        code,
        label: weatherLabels[code] ?? "天气变化",
        temperatureMax: Math.round(daily.temperature_2m_max[sourceIndex]),
        temperatureMin: Math.round(daily.temperature_2m_min[sourceIndex]),
        precipitationProbability: Math.round(daily.precipitation_probability_max[sourceIndex] ?? 0),
        windSpeedMax: Math.round(daily.wind_speed_10m_max[sourceIndex] ?? 0),
      };
    });

    const result: WeatherSummary = {
      location: [location.name, location.admin1, location.country].filter(Boolean).join(" · "),
      timezone: forecast.timezone || location.timezone || "auto",
      days: resultDays,
      sourceUrl: "https://open-meteo.com/",
      notice: withinForecast ? undefined : "出发日期超出 16 天预报范围，当前显示未来最近天气；临行前请再次查看。",
    };
    return Response.json({ weather: result }, { headers: { "Cache-Control": "public, max-age=900" } });
  } catch (error) {
    return Response.json({ error: errorMessage(error, "天气数据暂时不可用") }, { status: 502 });
  }
}
