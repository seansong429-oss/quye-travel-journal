import { getChatGPTUser } from "@/app/chatgpt-auth";
import { errorMessage } from "@/lib/api-utils";
import { getDb } from "@/db";
import { favorites } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

const allowedTypes = new Set(["destination", "route"]);

export async function GET() {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "请先登录后查看云端收藏" }, { status: 401 });
    const db = await getDb();
    const rows = await db.select().from(favorites).where(eq(favorites.userEmail, user.email)).orderBy(desc(favorites.createdAt));
    return Response.json({ favorites: rows });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "请先登录后同步收藏" }, { status: 401 });
    const body = (await request.json()) as { itemType?: "destination" | "route"; itemId?: string };
    if (!body.itemType || !allowedTypes.has(body.itemType) || !body.itemId?.trim()) return Response.json({ error: "收藏参数无效" }, { status: 400 });
    const db = await getDb();
    await db.insert(favorites).values({ userEmail: user.email, itemType: body.itemType, itemId: body.itemId.trim() }).onConflictDoNothing();
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "请先登录" }, { status: 401 });
    const url = new URL(request.url);
    const itemType = url.searchParams.get("itemType");
    const itemId = url.searchParams.get("itemId");
    if (!itemType || !allowedTypes.has(itemType) || !itemId) return Response.json({ error: "收藏参数无效" }, { status: 400 });
    const db = await getDb();
    await db.delete(favorites).where(and(eq(favorites.userEmail, user.email), eq(favorites.itemType, itemType as "destination" | "route"), eq(favorites.itemId, itemId)));
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
