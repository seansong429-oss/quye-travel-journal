import { errorMessage, runtimeValue } from "@/lib/api-utils";
import type { GeneratedItinerary, PlannerInput } from "@/lib/travel-types";

type DeepSeekResponse = {
  error?: { message?: string };
  choices?: Array<{ finish_reason?: string; message?: { content?: string | null } }>;
};

const itinerarySchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "summary", "days", "reminders"],
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    days: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "title", "items"],
        properties: {
          day: { type: "integer" },
          title: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["time", "place", "activity", "transport", "meal", "note"],
              properties: {
                time: { type: "string" },
                place: { type: "string" },
                activity: { type: "string" },
                transport: { type: "string" },
                meal: { type: "string" },
                note: { type: "string" },
              },
            },
          },
        },
      },
    },
    reminders: { type: "array", items: { type: "string" } },
  },
} as const;

function isPlannerInput(value: unknown): value is PlannerInput {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<PlannerInput>;
  return Boolean(
    input.destination?.trim() &&
      input.date &&
      Number(input.days) >= 1 &&
      Number(input.days) <= 14 &&
      input.people &&
      input.budget &&
      input.transport &&
      Array.isArray(input.interests) &&
      input.interests.length,
  );
}

function isGeneratedItinerary(value: unknown): value is Omit<GeneratedItinerary, "generatedAt" | "model"> {
  if (!value || typeof value !== "object") return false;
  const itinerary = value as Partial<GeneratedItinerary>;
  return Boolean(
    itinerary.title &&
      itinerary.summary &&
      Array.isArray(itinerary.reminders) &&
      Array.isArray(itinerary.days) &&
      itinerary.days.every((day) =>
        Number.isInteger(day.day) &&
        typeof day.title === "string" &&
        Array.isArray(day.items) &&
        day.items.every((item) =>
          [item.time, item.place, item.activity, item.transport, item.meal, item.note].every((field) => typeof field === "string" && field.trim()),
        ),
      ),
  );
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as unknown;
    if (!isPlannerInput(input)) {
      return Response.json({ error: "请完整填写目的地、日期、天数和旅行偏好" }, { status: 400 });
    }

    const apiKey = await runtimeValue("DEEPSEEK_API_KEY");
    if (!apiKey) {
      return Response.json(
        { error: "AI 行程服务尚未配置。请在站点环境变量中添加 DEEPSEEK_API_KEY。", code: "DEEPSEEK_NOT_CONFIGURED" },
        { status: 503 },
      );
    }

    const model = (await runtimeValue("DEEPSEEK_MODEL")) ?? "deepseek-v4-flash";
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 10000,
        temperature: 0.4,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              `你是严谨的中文旅行行程规划师。只输出 JSON，不要 Markdown。生成可执行但不过度拥挤的行程；不得声称实时营业、票价或交通信息已核验；地点应真实存在，餐饮写品类而非虚构店铺。每天 3 至 5 个时段，交通、餐饮和注意事项必须具体简洁。JSON 必须严格符合这个结构：${JSON.stringify(itinerarySchema)}`,
          },
          {
            role: "user",
            content: `请规划 ${input.destination} ${input.days} 天旅行：${input.date} 出发，${input.people} 人，预算 ${input.budget}，偏好 ${input.interests.join("、")}，主要交通 ${input.transport}。请严格生成 ${input.days} 天，并使用中文。`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const payload = (await response.json()) as DeepSeekResponse;
    if (!response.ok) {
      const upstream = payload.error?.message || `DeepSeek 服务返回 ${response.status}`;
      throw new Error(upstream);
    }

    const text = payload.choices?.[0]?.message?.content;
    if (!text) throw new Error("AI 没有返回可用的结构化行程");
    const parsed = JSON.parse(text) as unknown;
    if (!isGeneratedItinerary(parsed)) throw new Error("AI 返回的行程结构不完整，请重新生成");
    if (parsed.days.length !== Number(input.days)) {
      throw new Error("AI 返回的行程天数不完整，请重新生成");
    }

    return Response.json({ itinerary: { ...parsed, generatedAt: new Date().toISOString(), model } satisfies GeneratedItinerary });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 502 });
  }
}
