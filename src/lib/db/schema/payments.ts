import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { orders } from "./orders";

export const paymentMethodEnum = ["stripe", "paypal", "cod"] as const;
export const paymentStatusEnum = ["initiated", "completed", "failed"] as const;

export const payments = pgTable("payments", {
	id: uuid("id").primaryKey().defaultRandom(),
	orderId: uuid("order_id")
		.notNull()
		.references(() => orders.id, { onDelete: "cascade" }),
	method: text("method", { enum: paymentMethodEnum }).notNull(),
	status: text("status", { enum: paymentStatusEnum })
		.notNull()
		.default("initiated"),
	paidAt: timestamp("paidAt"),
	transactionId: text("transactionId"),
	stripePaymentIntentId: text("stripePaymentIntentId"),
	stripeSessionId: text("stripeSessionId"),
	amount: text("amount").notNull(), // Importo in centesimi come stringa
	currency: text("currency").notNull().default('eur'),
	stripeWebhookEventId: text("stripeWebhookEventId"),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
	order: one(orders, {
		fields: [payments.orderId],
		references: [orders.id],
	}),
}));

export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type SelectPayment = z.infer<typeof selectPaymentSchema>;
