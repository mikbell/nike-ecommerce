CREATE TABLE "productVariants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"productId" uuid NOT NULL,
	"sku" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"salePrice" numeric(10, 2),
	"colorId" uuid NOT NULL,
	"sizeId" uuid NOT NULL,
	"inStock" integer DEFAULT 0 NOT NULL,
	"weight" numeric(10, 2),
	"dimensions" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "productVariants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "productImages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"productId" uuid NOT NULL,
	"variantId" uuid,
	"url" text NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isPrimary" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cartItems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cartId" uuid NOT NULL,
	"productVariantId" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orderItems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orderId" uuid NOT NULL,
	"productVariantId" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"priceAtPurchase" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "productCollections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"productId" uuid NOT NULL,
	"collectionId" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_variants" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product_images" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "cart_items" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "order_items" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product_collections" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "product_variants" CASCADE;--> statement-breakpoint
DROP TABLE "product_images" CASCADE;--> statement-breakpoint
DROP TABLE "cart_items" CASCADE;--> statement-breakpoint
DROP TABLE "order_items" CASCADE;--> statement-breakpoint
DROP TABLE "product_collections" CASCADE;--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_gender_id_genders_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_brand_id_brands_id_fk";
--> statement-breakpoint
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "carts" DROP CONSTRAINT "carts_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "carts" DROP CONSTRAINT "carts_guest_id_guest_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_shipping_address_id_addresses_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_billing_address_id_addresses_id_fk";
--> statement-breakpoint
ALTER TABLE "wishlists" DROP CONSTRAINT "wishlists_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "wishlists" DROP CONSTRAINT "wishlists_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "categoryId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "genderId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "brandId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "isPublished" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "defaultVariantId" uuid;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "colors" ADD COLUMN "hexCode" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sizes" ADD COLUMN "sortOrder" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "logoUrl" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "parentId" uuid;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "userId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "postalCode" text NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "isDefault" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "productId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "userId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "userId" uuid;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "guestId" text;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "userId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "totalAmount" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shippingAddressId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "billingAddressId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "paidAt" timestamp;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "transactionId" text;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "discountType" text NOT NULL;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "discountValue" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "expiresAt" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "maxUsage" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "usedCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "wishlists" ADD COLUMN "userId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "wishlists" ADD COLUMN "productId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "wishlists" ADD COLUMN "addedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "productVariants" ADD CONSTRAINT "productVariants_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productVariants" ADD CONSTRAINT "productVariants_colorId_colors_id_fk" FOREIGN KEY ("colorId") REFERENCES "public"."colors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productVariants" ADD CONSTRAINT "productVariants_sizeId_sizes_id_fk" FOREIGN KEY ("sizeId") REFERENCES "public"."sizes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productImages" ADD CONSTRAINT "productImages_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productImages" ADD CONSTRAINT "productImages_variantId_productVariants_id_fk" FOREIGN KEY ("variantId") REFERENCES "public"."productVariants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cartItems" ADD CONSTRAINT "cartItems_cartId_carts_id_fk" FOREIGN KEY ("cartId") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cartItems" ADD CONSTRAINT "cartItems_productVariantId_productVariants_id_fk" FOREIGN KEY ("productVariantId") REFERENCES "public"."productVariants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orderItems" ADD CONSTRAINT "orderItems_orderId_orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orderItems" ADD CONSTRAINT "orderItems_productVariantId_productVariants_id_fk" FOREIGN KEY ("productVariantId") REFERENCES "public"."productVariants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productCollections" ADD CONSTRAINT "productCollections_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productCollections" ADD CONSTRAINT "productCollections_collectionId_collections_id_fk" FOREIGN KEY ("collectionId") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_genderId_genders_id_fk" FOREIGN KEY ("genderId") REFERENCES "public"."genders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brandId_brands_id_fk" FOREIGN KEY ("brandId") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_guestId_guest_id_fk" FOREIGN KEY ("guestId") REFERENCES "public"."guest"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_shippingAddressId_addresses_id_fk" FOREIGN KEY ("shippingAddressId") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_billingAddressId_addresses_id_fk" FOREIGN KEY ("billingAddressId") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "gender_id";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "brand_id";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "is_published";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "default_variant_id";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "colors" DROP COLUMN "hex_code";--> statement-breakpoint
ALTER TABLE "sizes" DROP COLUMN "sort_order";--> statement-breakpoint
ALTER TABLE "brands" DROP COLUMN "logo_url";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "parent_id";--> statement-breakpoint
ALTER TABLE "collections" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "postal_code";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "is_default";--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN "product_id";--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "carts" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "carts" DROP COLUMN "guest_id";--> statement-breakpoint
ALTER TABLE "carts" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "carts" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "total_amount";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "shipping_address_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "billing_address_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "paid_at";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "transaction_id";--> statement-breakpoint
ALTER TABLE "coupons" DROP COLUMN "discount_type";--> statement-breakpoint
ALTER TABLE "coupons" DROP COLUMN "discount_value";--> statement-breakpoint
ALTER TABLE "coupons" DROP COLUMN "expires_at";--> statement-breakpoint
ALTER TABLE "coupons" DROP COLUMN "max_usage";--> statement-breakpoint
ALTER TABLE "coupons" DROP COLUMN "used_count";--> statement-breakpoint
ALTER TABLE "wishlists" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "wishlists" DROP COLUMN "product_id";--> statement-breakpoint
ALTER TABLE "wishlists" DROP COLUMN "added_at";