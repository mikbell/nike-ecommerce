import { pgTable, text, uuid, numeric, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./user";
import { addresses } from "./addresses";

export const orderStatusEnum = [
	"pending",
	"paid",
	"shipped",
	"delivered",
	"cancelled",
] as const;

export const orders = pgTable("orders", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	status: text("status", { enum: orderStatusEnum })
		.notNull()
		.default("pending"),
	totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
	shippingAddressId: uuid("shipping_address_id")
		.notNull()
		.references(() => addresses.id),
	billingAddressId: uuid("billing_address_id")
		.notNull()
		.references(() => addresses.id),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ordersRelations = relations(orders, ({ one }) => ({
	user: one(user, {
		fields: [orders.userId],
		references: [user.id],
	}),
	shippingAddress: one(addresses, {
		fields: [orders.shippingAddressId],
		references: [addresses.id],
	}),
	billingAddress: one(addresses, {
		fields: [orders.billingAddressId],
		references: [addresses.id],
	}),
}));

export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type SelectOrder = z.infer<typeof selectOrderSchema>;
