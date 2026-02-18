import { createRoute, z } from "@hono/zod-openapi"
import { IPlayerSchema } from "../../../utils"

const ICashLeaderboardEntry = z.object({
	user_id: z.number(),
	cash: z.number()
})

const IPlaytimeLeaderboardEntry = z.object({
	user_id: z.number(),
	playtime: z.number()
})

const IRobuxSpentLeaderboardEntry = z.object({
	user_id: z.number(),
	robux_spent: z.number()
})

export const IListResponse = z.object({
	cash: z.array(ICashLeaderboardEntry).max(100),
	playtime: z.array(IPlaytimeLeaderboardEntry).max(100),
	robux_spent: z.array(IRobuxSpentLeaderboardEntry).max(100)
})

export const list_route = createRoute({
	method: "get",
	tags: ["Leaderboard"],
	path: "/list",
	security: [
		{
			Bearer: []
		}
	],
	responses: {
		200: {
			content: {
				"application/json": {
					schema: IListResponse
				}
			},
			description: "Leaderboard lists retrieved successfully"
		}
	}
})
