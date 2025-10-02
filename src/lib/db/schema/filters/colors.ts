import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const colors = pgTable("colors", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	hexCode: text("hex_code").notNull(),
});

export const insertColorSchema = createInsertSchema(colors);
export const selectColorSchema = createSelectSchema(colors);
export type InsertColor = z.infer<typeof insertColorSchema>;
export type SelectColor = z.infer<typeof selectColorSchema>;
