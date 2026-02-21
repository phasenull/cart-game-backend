import { defineConfig } from "drizzle-kit"

export default defineConfig({
	dialect: "sqlite",
	driver: "d1-http",
	schema: "./src/schema.ts",
	out: "./drizzle",
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
		databaseId: "55bc4177-4d0b-40ad-b12c-75ea0526d4e9",
		token: process.env.CLOUDFLARE_D1_TOKEN!,
	}
})
