import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const collections = pgTable("collections", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const insertCollectionSchema = createInsertSchema(collections);
export const selectCollectionSchema = createSelectSchema(collections);
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type SelectCollection = z.infer<typeof selectCollectionSchema>;
