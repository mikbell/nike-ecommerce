import { pgTable, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { products } from "./product";
import { collections } from "./collections";

export const productCollections = pgTable("productCollections", {
	id: uuid("id").primaryKey().defaultRandom(),
	productId: uuid("productId")
		.notNull()
		.references(() => products.id, { onDelete: "cascade" }),
	collectionId: uuid("collectionId")
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
