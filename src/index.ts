import { OpenAPIHono } from "@hono/zod-openapi"
import { serve } from "bun"
import { Hono } from "hono"
import { jwt } from "hono/jwt"
import { LeaderboardController } from "./controllers/leaderboard/leaderboard.controller"
import { swaggerUI } from "@hono/swagger-ui"
import { logger } from "hono/logger"

export const app = new OpenAPIHono()
app.use("*",logger())

export const server = serve({
	fetch: app.fetch,
	error: (err) => {
		console.error(err)
		return new Response("Internal Server Error", { status: 500 })
	},
	hostname: "0.0.0.0"
})
app.route("/leaderboard", LeaderboardController)
app.get(
	"/swagger",
	swaggerUI({
		url: "/docs/openapi.json"
	})
)
app.doc("/docs/openapi.json", {
	openapi: "3.0.0",
	info: {
		title: "Cart Game Backend API",
		version: "1.0.0"
	}
})
app.onError((err, c) => {
	console.error(err)
	return c.json({ error: "Internal Server Error" }, 500)
})
console.log(`started server on: http://${server.hostname}:${server.port}`)
