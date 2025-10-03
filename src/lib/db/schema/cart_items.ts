import { pgTable, uuid, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { carts } from "./carts";
import { productVariants } from "./variants";

export const cartItems = pgTable("cartItems", {
	id: uuid("id").primaryKey().defaultRandom(),
	cartId: uuid("cartId")
		.notNull()
		.references(() => carts.id, { onDelete: "cascade" }),
	productVariantId: uuid("productVariantId")
		.notNull()
		.references(() => productVariants.id, { onDelete: "cascade" }),
	quantity: integer("quantity").notNull().default(1),
});

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
	cart: one(carts, {
		fields: [cartItems.cartId],
		references: [carts.id],
	}),
	productVariant: one(productVariants, {
		fields: [cartItems.productVariantId],
		references: [productVariants.id],
	}),
}));

export const insertCartItemSchema = createInsertSchema(cartItems);
export const selectCartItemSchema = createSelectSchema(cartItems);
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type SelectCartItem = z.infer<typeof selectCartItemSchema>;
