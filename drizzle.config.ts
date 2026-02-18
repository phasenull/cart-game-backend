import type { DrizzleConfig } from "drizzle-orm"
import type { DrizzleBunSqliteDatabaseConfig } from "drizzle-orm/bun-sqlite"
import { defineConfig } from "drizzle-kit"
export default defineConfig({
	dialect: "sqlite",
	schema: "./src/schema.ts",
	dbCredentials: {
		url: "./db.sqlite"
	}
})
