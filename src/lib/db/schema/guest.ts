import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const guest = pgTable('guest', {
  id: text('id').primaryKey(),
  sessionToken: text('sessionToken').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  expiresAt: timestamp('expiresAt').notNull(),
});
