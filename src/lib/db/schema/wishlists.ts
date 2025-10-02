import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./user";
import { products } from "./product";

export const wishlists = pgTable("wishlists", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	productId: uuid("product_id")
		.notNull()
		.references(() => products.id, { onDelete: "cascade" }),
	addedAt: timestamp("added_at").notNull().defaultNow(),
});

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
	user: one(user, {
		fields: [wishlists.userId],
		references: [user.id],
	}),
	product: one(products, {
		fields: [wishlists.productId],
		references: [products.id],
	}),
}));

export const insertWishlistSchema = createInsertSchema(wishlists);
export const selectWishlistSchema = createSelectSchema(wishlists);
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type SelectWishlist = z.infer<typeof selectWishlistSchema>;
