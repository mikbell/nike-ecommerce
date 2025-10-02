import { pgTable, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { products } from "./product";
import { collections } from "./collections";

export const productCollections = pgTable("product_collections", {
	id: uuid("id").primaryKey().defaultRandom(),
	productId: uuid("product_id")
		.notNull()
		.references(() => products.id, { onDelete: "cascade" }),
	collectionId: uuid("collection_id")
		.notNull()
		.references(() => collections.id, { onDelete: "cascade" }),
});

export const productCollectionsRelations = relations(
	productCollections,
	({ one }) => ({
		product: one(products, {
			fields: [productCollections.productId],
			references: [products.id],
		}),
		collection: one(collections, {
			fields: [productCollections.collectionId],
			references: [collections.id],
		}),
	})
);

export const insertProductCollectionSchema =
	createInsertSchema(productCollections);
export const selectProductCollectionSchema =
	createSelectSchema(productCollections);
export type InsertProductCollection = z.infer<
	typeof insertProductCollectionSchema
>;
export type SelectProductCollection = z.infer<
	typeof selectProductCollectionSchema
>;
