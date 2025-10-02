import { pgTable, text, uuid, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { products } from "./product";
import { productVariants } from "./variants";

export const productImages = pgTable("product_images", {
	id: uuid("id").primaryKey().defaultRandom(),
	productId: uuid("product_id")
		.notNull()
		.references(() => products.id, { onDelete: "cascade" }),
	variantId: uuid("variant_id").references(() => productVariants.id, {
		onDelete: "cascade",
	}),
	url: text("url").notNull(),
	sortOrder: integer("sort_order").notNull().default(0),
	isPrimary: boolean("is_primary").notNull().default(false),
});

export const productImagesRelations = relations(productImages, ({ one }) => ({
	product: one(products, {
		fields: [productImages.productId],
		references: [products.id],
	}),
	variant: one(productVariants, {
		fields: [productImages.variantId],
		references: [productVariants.id],
	}),
}));

export const insertProductImageSchema = createInsertSchema(productImages);
export const selectProductImageSchema = createSelectSchema(productImages);
export type InsertProductImage = z.infer<typeof insertProductImageSchema>;
export type SelectProductImage = z.infer<typeof selectProductImageSchema>;
