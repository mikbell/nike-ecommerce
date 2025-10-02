import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./user";
import { guest } from "./guest";

export const carts = pgTable("carts", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").references(() => user.id, { onDelete: "cascade" }),
	guestId: text("guest_id").references(() => guest.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cartsRelations = relations(carts, ({ one }) => ({
	user: one(user, {
		fields: [carts.userId],
		references: [user.id],
	}),
	guest: one(guest, {
		fields: [carts.guestId],
		references: [guest.id],
	}),
}));

export const insertCartSchema = createInsertSchema(carts);
export const selectCartSchema = createSelectSchema(carts);
export type InsertCart = z.infer<typeof insertCartSchema>;
export type SelectCart = z.infer<typeof selectCartSchema>;
