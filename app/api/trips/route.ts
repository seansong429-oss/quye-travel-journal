import { getChatGPTUser } from "@/app/chatgpt-auth";
import { errorMessage } from "@/lib/api-utils";
import type { GeneratedItinerary, SavedTripRecord } from "@/lib/travel-types";
import { getDb } from "@/db";
import { savedTrips } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

function toRecord(row: typeof savedTrips.$inferSelect): SavedTripRecord {
  return { id: row.id, title: row.title, destination: row.destination, itinerary: JSON.parse(row.payload) as GeneratedItinerary, createdAt: row.createdAt, updatedAt: row.updatedAt };
}

export async function GET() {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "请先登录后查看云端行程" }, { status: 401 });
    const db = await getDb();
    const rows = await db.select().from(savedTrips).where(eq(savedTrips.userEmail, user.email)).orderBy(desc(savedTrips.updatedAt)).limit(20);
    return Response.json({ trips: rows.map(toRecord) });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "请先登录后同步行程" }, { status: 401 });
    const body = (await request.json()) as { destination?: string; itinerary?: GeneratedItinerary };
    if (!body.destination?.trim() || !body.itinerary?.title || !Array.isArray(body.itinerary.days)) return Response.json({ error: "行程数据无效" }, { status: 400 });
    const now = new Date().toISOString();
    const row = { id: crypto.randomUUID(), userEmail: user.email, title: body.itinerary.title, destination: body.destination.trim(), payload: JSON.stringify(body.itinerary), createdAt: now, updatedAt: now };
    const db = await getDb();
    await db.insert(savedTrips).values(row);
    return Response.json({ trip: toRecord(row) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "请先登录" }, { status: 401 });
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return Response.json({ error: "缺少行程编号" }, { status: 400 });
    const db = await getDb();
    await db.delete(savedTrips).where(and(eq(savedTrips.id, id), eq(savedTrips.userEmail, user.email)));
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
