import { pgTable, uuid, integer, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { orders } from "./orders";
import { productVariants } from "./variants";

export const orderItems = pgTable("orderItems", {
	id: uuid("id").primaryKey().defaultRandom(),
	orderId: uuid("orderId")
		.notNull()
		.references(() => orders.id, { onDelete: "cascade" }),
	productVariantId: uuid("productVariantId")
		.notNull()
		.references(() => productVariants.id),
	quantity: integer("quantity").notNull(),
	priceAtPurchase: numeric("priceAtPurchase", {
		precision: 10,
		scale: 2,
	}).notNull(),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id],
	}),
	productVariant: one(productVariants, {
		fields: [orderItems.productVariantId],
		references: [productVariants.id],
	}),
}));

export const insertOrderItemSchema = createInsertSchema(orderItems);
export const selectOrderItemSchema = createSelectSchema(orderItems);
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type SelectOrderItem = z.infer<typeof selectOrderItemSchema>;
