ALTER TABLE "orders" ALTER COLUMN "shippingAddressId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "billingAddressId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cartItems" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "cartItems" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "subtotal" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tax" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "currency" text DEFAULT 'eur' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "stripeSessionId" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "stripePaymentIntentId" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "orderNumber" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shippingAddress" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "billingAddress" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customerEmail" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customerPhone" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "stripePaymentIntentId" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "stripeSessionId" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "amount" text NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "currency" text DEFAULT 'eur' NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "stripeWebhookEventId" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_orderNumber_unique" UNIQUE("orderNumber");