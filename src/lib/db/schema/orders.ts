import { pgTable, text, uuid, numeric, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./user";
import { addresses } from "./addresses";
import { orderItems } from "./order_items";
import { payments } from "./payments";

export const orderStatusEnum = [
	"pending",
	"paid",
	"shipped",
	"delivered",
	"cancelled",
] as const;

export const orders = pgTable("orders", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	status: text("status", { enum: orderStatusEnum })
		.notNull()
		.default("pending"),
	totalAmount: numeric("totalAmount", { precision: 10, scale: 2 }).notNull(),
	subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
	tax: numeric("tax", { precision: 10, scale: 2 }).notNull().default('0'),
	shipping: numeric("shipping", { precision: 10, scale: 2 }).notNull().default('0'),
	currency: text("currency").notNull().default('eur'),
	stripeSessionId: text("stripeSessionId"),
	stripePaymentIntentId: text("stripePaymentIntentId"),
	orderNumber: text("orderNumber").notNull().unique(),
	shippingAddressId: uuid("shippingAddressId")
		.references(() => addresses.id),
	billingAddressId: uuid("billingAddressId")
		.references(() => addresses.id),
	// Campi per indirizzo senza riferimento a tabella addresses
	shippingAddress: text("shippingAddress"),
	billingAddress: text("billingAddress"),
	customerEmail: text("customerEmail"),
	customerPhone: text("customerPhone"),
	notes: text("notes"),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
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
	orderItems: many(orderItems),
	payments: many(payments),
}));

export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type SelectOrder = z.infer<typeof selectOrderSchema>;
