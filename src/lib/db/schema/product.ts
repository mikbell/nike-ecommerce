import { pgTable, text, uuid, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { categories } from "./categories";
import { brands } from "./brands";
import { genders } from "./filters/genders";

export const products = pgTable("products", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	description: text("description"),
	categoryId: uuid("categoryId")
		.notNull()
		.references(() => categories.id),
	genderId: uuid("genderId")
		.notNull()
		.references(() => genders.id),
	brandId: uuid("brandId")
		.notNull()
		.references(() => brands.id),
	isPublished: boolean("isPublished").notNull().default(true),
	defaultVariantId: uuid("defaultVariantId"),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const productsRelations = relations(products, ({ one }) => ({
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id],
	}),
	gender: one(genders, {
		fields: [products.genderId],
		references: [genders.id],
	}),
	brand: one(brands, {
		fields: [products.brandId],
		references: [brands.id],
	}),
}));

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type SelectProduct = z.infer<typeof selectProductSchema>;
