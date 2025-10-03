import { pgTable, text, uuid, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const sizes = pgTable("sizes", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	sortOrder: integer("sortOrder").notNull().default(0),
});

export const insertSizeSchema = createInsertSchema(sizes);
export const selectSizeSchema = createSelectSchema(sizes);
export type InsertSize = z.infer<typeof insertSizeSchema>;
export type SelectSize = z.infer<typeof selectSizeSchema>;
