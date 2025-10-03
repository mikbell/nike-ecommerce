import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const brands = pgTable("brands", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	logoUrl: text("logoUrl"),
});

export const insertBrandSchema = createInsertSchema(brands);
export const selectBrandSchema = createSelectSchema(brands);
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type SelectBrand = z.infer<typeof selectBrandSchema>;
