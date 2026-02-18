import { createRoute, z } from "@hono/zod-openapi"
import { playersTable } from "../../../schema"
import { ErrorResponse, IPlayerSchema } from "../../../utils"
import { createSelectSchema } from "drizzle-orm/zod"
const IUpdatePlayerDTO = z.object({
	user_id: z.int().or(z.string().transform((val) => parseInt(val)))
})
const IResponse = z.object({
	player: z.strictObject(playersTable.$inferSelect)
})

export const update_player_route = createRoute({
	method: "post",
	tags: ["Leaderboard"],
	path: "/update-player",
	security: [
		{
			Bearer: []
		}
	],
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean().default(true)
					})
				}
			},
			description: "Player updated successfully"
		},
		400: ErrorResponse
	},
	request: {
		body: {
			description: "Player data to update",
			content: {
				"application/json": {
					schema: IPlayerSchema.omit({created_at: true, updated_at: true})
				}
			}
		}
	}
})
