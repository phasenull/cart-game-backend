import { drizzle } from "drizzle-orm/d1"
import z from "zod"
import * as schema from "./schema"
import { createSelectSchema } from "drizzle-orm/zod"
import type { DrizzleD1Database } from "drizzle-orm/d1"

export type Database = DrizzleD1Database<typeof schema>

export const getDb = (d1: any) => drizzle(d1, { schema })

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