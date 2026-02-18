import { OpenAPIHono } from "@hono/zod-openapi"
import { serve } from "bun"
import { Hono } from "hono"
import { jwt } from "hono/jwt"
import { LeaderboardController } from "./controllers/leaderboard/leaderboard.controller"
import { AdminController } from "./controllers/admin/admin.controller"
import { swaggerUI } from "@hono/swagger-ui"
import { logger } from "hono/logger"

export const app = new OpenAPIHono()
app.use("*", logger())

// Mount admin routes first (without JWT protection on sign endpoint)
app.route("/admin", AdminController)

// JWT middleware for all routes except /admin/sign, /swagger, and /docs
const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-in-production"
app.use("/leaderboard/*", async (c, next) => {
	try {
		return await jwt({ secret: JWT_SECRET, alg: "HS256" })(c, next)
	} catch (error) {
		return c.json({ error: "Forbidden - Invalid or missing token" }, 403)
	}
})

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
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
	type: "http",
	scheme: "bearer",
	bearerFormat: "JWT",
	description: "Enter your JWT token"
})
app.onError((err, c) => {
	console.error(err)
	return c.json({ error: "Internal Server Error" }, 500)
})
console.log(`started server on: http://${server.hostname}:${server.port}`)
