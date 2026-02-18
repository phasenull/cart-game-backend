import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import z from "zod"
import * as schema from "./schema"
import { createSelectSchema } from "drizzle-orm/zod"
const database = new Database("./db.sqlite")
export const db = drizzle<typeof schema>("db.sqlite", { schema })

const IErrorResponseSchema = z.object({
	error: z.string()
})
export const ErrorResponse = {
	content: {
		"application/json": { schema: IErrorResponseSchema }
	},
	description: "Error"
}
export const IPlayerSchema = createSelectSchema(schema.playersTable) 