import { pgTable, text, uuid, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const discountTypeEnum = ["percentage", "fixed"] as const;

export const coupons = pgTable("coupons", {
	id: uuid("id").primaryKey().defaultRandom(),
	code: text("code").notNull().unique(),
	discountType: text("discountType", { enum: discountTypeEnum }).notNull(),
	discountValue: numeric("discountValue", { precision: 10, scale: 2 }).notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	maxUsage: integer("maxUsage").notNull(),
	usedCount: integer("usedCount").notNull().default(0),
});

export const insertCouponSchema = createInsertSchema(coupons);
export const selectCouponSchema = createSelectSchema(coupons);
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type SelectCoupon = z.infer<typeof selectCouponSchema>;
