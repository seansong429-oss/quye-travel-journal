import { sql } from "drizzle-orm";
import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const favorites = sqliteTable(
  "favorites",
  {
    userEmail: text("user_email").notNull(),
    itemType: text("item_type", { enum: ["destination", "route"] }).notNull(),
    itemId: text("item_id").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [primaryKey({ columns: [table.userEmail, table.itemType, table.itemId] })],
);

export const savedTrips = sqliteTable("saved_trips", {
  id: text("id").primaryKey(),
  userEmail: text("user_email").notNull(),
  title: text("title").notNull(),
  destination: text("destination").notNull(),
  payload: text("payload").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
