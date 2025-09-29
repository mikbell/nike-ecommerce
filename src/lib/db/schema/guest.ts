import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const guest = pgTable('guest', {
  id: uuid('id').primaryKey(),
  sessionToken: text('sessionToken').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  expiresAt: timestamp('expiresAt').notNull(),
});
