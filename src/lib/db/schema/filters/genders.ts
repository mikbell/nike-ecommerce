import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const genders = pgTable("genders", {
	id: uuid("id").primaryKey().defaultRandom(),
	label: text("label").notNull(),
	slug: text("slug").notNull().unique(),
});

export const insertGenderSchema = createInsertSchema(genders);
export const selectGenderSchema = createSelectSchema(genders);
export type InsertGender = z.infer<typeof insertGenderSchema>;
export type SelectGender = z.infer<typeof selectGenderSchema>;
