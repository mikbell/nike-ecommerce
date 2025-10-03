-- Convert existing id columns to UUID type
-- This migration handles the case where existing tables have non-UUID id columns

-- First, let's check what type the existing id columns are
-- and convert them to UUID with proper casting

-- For each table, we'll add a new UUID column, copy data, then replace the old column

-- Users table
ALTER TABLE "user" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "user" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "user" DROP COLUMN "id";
ALTER TABLE "user" RENAME COLUMN "id_new" TO "id";

-- Categories table
ALTER TABLE "categories" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "categories" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "categories" DROP COLUMN "id";
ALTER TABLE "categories" RENAME COLUMN "id_new" TO "id";

-- Products table
ALTER TABLE "products" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "products" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "products" DROP COLUMN "id";
ALTER TABLE "products" RENAME COLUMN "id_new" TO "id";

-- Colors table (from filters/colors.ts)
ALTER TABLE "colors" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "colors" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "colors" DROP COLUMN "id";
ALTER TABLE "colors" RENAME COLUMN "id_new" TO "id";

-- Sizes table (from filters/sizes.ts)
ALTER TABLE "sizes" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "sizes" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "sizes" DROP COLUMN "id";
ALTER TABLE "sizes" RENAME COLUMN "id_new" TO "id";

-- Brands table
ALTER TABLE "brands" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "brands" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "brands" DROP COLUMN "id";
ALTER TABLE "brands" RENAME COLUMN "id_new" TO "id";

-- Genders table (from filters)
ALTER TABLE "genders" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "genders" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "genders" DROP COLUMN "id";
ALTER TABLE "genders" RENAME COLUMN "id_new" TO "id";

-- Collections table
ALTER TABLE "collections" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "collections" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "collections" DROP COLUMN "id";
ALTER TABLE "collections" RENAME COLUMN "id_new" TO "id";

-- Variants table
ALTER TABLE "variants" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "variants" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "variants" DROP COLUMN "id";
ALTER TABLE "variants" RENAME COLUMN "id_new" TO "id";

-- Product images table
ALTER TABLE "product_images" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "product_images" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "product_images" DROP COLUMN "id";
ALTER TABLE "product_images" RENAME COLUMN "id_new" TO "id";

-- Reviews table
ALTER TABLE "reviews" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "reviews" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "reviews" DROP COLUMN "id";
ALTER TABLE "reviews" RENAME COLUMN "id_new" TO "id";

-- Carts table
ALTER TABLE "carts" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "carts" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "carts" DROP COLUMN "id";
ALTER TABLE "carts" RENAME COLUMN "id_new" TO "id";

-- Cart items table
ALTER TABLE "cart_items" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "cart_items" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "cart_items" DROP COLUMN "id";
ALTER TABLE "cart_items" RENAME COLUMN "id_new" TO "id";

-- Orders table
ALTER TABLE "orders" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "orders" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "orders" DROP COLUMN "id";
ALTER TABLE "orders" RENAME COLUMN "id_new" TO "id";

-- Order items table
ALTER TABLE "order_items" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "order_items" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "order_items" DROP COLUMN "id";
ALTER TABLE "order_items" RENAME COLUMN "id_new" TO "id";

-- Payments table
ALTER TABLE "payments" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "payments" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "payments" DROP COLUMN "id";
ALTER TABLE "payments" RENAME COLUMN "id_new" TO "id";

-- Coupons table
ALTER TABLE "coupons" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "coupons" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "coupons" DROP COLUMN "id";
ALTER TABLE "coupons" RENAME COLUMN "id_new" TO "id";

-- Wishlists table
ALTER TABLE "wishlists" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "wishlists" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "wishlists" DROP COLUMN "id";
ALTER TABLE "wishlists" RENAME COLUMN "id_new" TO "id";

-- Product collections table
ALTER TABLE "product_collections" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "product_collections" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "product_collections" DROP COLUMN "id";
ALTER TABLE "product_collections" RENAME COLUMN "id_new" TO "id";

-- Sessions table
ALTER TABLE "session" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "session" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "session" DROP COLUMN "id";
ALTER TABLE "session" RENAME COLUMN "id_new" TO "id";

-- Account table
ALTER TABLE "account" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "account" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "account" DROP COLUMN "id";
ALTER TABLE "account" RENAME COLUMN "id_new" TO "id";

-- Verification table
ALTER TABLE "verification" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "verification" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "verification" DROP COLUMN "id";
ALTER TABLE "verification" RENAME COLUMN "id_new" TO "id";

-- Guest table
ALTER TABLE "guest" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "guest" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "guest" DROP COLUMN "id";
ALTER TABLE "guest" RENAME COLUMN "id_new" TO "id";

-- Addresses table
ALTER TABLE "addresses" ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid();
UPDATE "addresses" SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL;
ALTER TABLE "addresses" DROP COLUMN "id";
ALTER TABLE "addresses" RENAME COLUMN "id_new" TO "id";
