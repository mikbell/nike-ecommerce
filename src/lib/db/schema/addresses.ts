import { pgTable, text, uuid, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./user";

export const addressTypeEnum = ["billing", "shipping"] as const;

export const addresses = pgTable("addresses", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	type: text("type", { enum: addressTypeEnum }).notNull(),
	line1: text("line1").notNull(),
	line2: text("line2"),
	city: text("city").notNull(),
	state: text("state").notNull(),
	country: text("country").notNull(),
	postalCode: text("postalCode").notNull(),
	isDefault: boolean("isDefault").notNull().default(false),
});

export const addressesRelations = relations(addresses, ({ one }) => ({
	user: one(user, {
		fields: [addresses.userId],
		references: [user.id],
	}),
}));

export const insertAddressSchema = createInsertSchema(addresses);
export const selectAddressSchema = createSelectSchema(addresses);
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type SelectAddress = z.infer<typeof selectAddressSchema>;
