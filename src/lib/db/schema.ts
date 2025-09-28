import { pgTable, serial, varchar, text, decimal, integer, timestamp } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  category: varchar('category', { length: 100 }),
  brand: varchar('brand', { length: 100 }).default('Nike'),
  size: varchar('size', { length: 50 }),
  color: varchar('color', { length: 50 }),
  stock: integer('stock').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});