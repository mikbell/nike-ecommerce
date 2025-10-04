import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Create database connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

async function convertIdsToUUID() {
	try {
		console.log("Starting UUID conversion...");

		// List of tables to convert
		const tables = [
			"user",
			"session",
			"account",
			"verification",
			"guest",
			"categories",
			"products",
			"brands",
			"genders",
			"colors",
			"sizes",
			"collections",
			"variants",
			"product_variants",
			"reviews",
			"carts",
			"cart_items",
			"orders",
			"order_items",
			"payments",
			"coupons",
			"wishlists",
			"product_collections",
			"addresses",
		];

		for (const table of tables) {
			try {
				console.log(`Converting ${table}...`);

				// Add new UUID column
				await client`ALTER TABLE ${client(
					table
				)} ADD COLUMN "id_new" UUID DEFAULT gen_random_uuid()`;

				// Update new column with cast values
				await client`UPDATE ${client(
					table
				)} SET "id_new" = "id"::UUID WHERE "id" IS NOT NULL`;

				// Drop old column
				await client`ALTER TABLE ${client(table)} DROP COLUMN "id"`;

				// Rename new column
				await client`ALTER TABLE ${client(
					table
				)} RENAME COLUMN "id_new" TO "id"`;

				console.log(`✓ Converted ${table}`);
			} catch (error) {
				console.error(`✗ Failed to convert ${table}:`, error);
			}
		}

		console.log("UUID conversion completed!");
	} catch (error) {
		console.error("Error during UUID conversion:", error);
	} finally {
		await client.end();
	}
}

convertIdsToUUID();
