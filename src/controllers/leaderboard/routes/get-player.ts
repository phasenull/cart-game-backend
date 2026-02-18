import { createRoute, z } from "@hono/zod-openapi"
import { playersTable } from "../../../schema"
import { ErrorResponse, IPlayerSchema } from "../../../utils"
import { createSelectSchema } from "drizzle-orm/zod"
export const IFindPlayerQuery = z.object({
	user_id: z.int().or(z.string().transform((val) => parseInt(val)))
})
export const IFindPlayerResponse = z.object({
	player: IPlayerSchema,
	ranks: z.object({
		cash: z.number(),
		playtime: z.number(),
		robux_spent: z.number()
	})
})

export const get_player_route = createRoute({
	method: "get",
	path: "/get-player",
	tags: ["Leaderboard"],
	responses: {
		200: {
			content: {
				"application/json": {
					schema: IFindPlayerResponse
				}
			},
			description: "Player found successfully"
		},
		400: ErrorResponse
	},
	request: {
		query: IFindPlayerQuery
	}
})
