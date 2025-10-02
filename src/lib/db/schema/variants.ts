import { pgTable, text, uuid, numeric, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { products } from "./product";
import { colors } from "./filters/colors";
import { sizes } from "./filters/sizes";

export const productVariants = pgTable("product_variants", {
	id: uuid("id").primaryKey().defaultRandom(),
	productId: uuid("product_id")
		.notNull()
		.references(() => products.id, { onDelete: "cascade" }),
	sku: text("sku").notNull().unique(),
	price: numeric("price", { precision: 10, scale: 2 }).notNull(),
	salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
	colorId: uuid("color_id")
		.notNull()
		.references(() => colors.id),
	sizeId: uuid("size_id")
		.notNull()
		.references(() => sizes.id),
	inStock: integer("in_stock").notNull().default(0),
	weight: numeric("weight", { precision: 10, scale: 2 }),
	dimensions: jsonb("dimensions").$type<{
		length: number;
		width: number;
		height: number;
	}>(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
	product: one(products, {
		fields: [productVariants.productId],
		references: [products.id],
	}),
	color: one(colors, {
		fields: [productVariants.colorId],
		references: [colors.id],
	}),
	size: one(sizes, {
		fields: [productVariants.sizeId],
		references: [sizes.id],
	}),
}));

export const insertProductVariantSchema = createInsertSchema(productVariants);
export const selectProductVariantSchema = createSelectSchema(productVariants);
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type SelectProductVariant = z.infer<typeof selectProductVariantSchema>;
