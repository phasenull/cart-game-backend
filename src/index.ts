import { OpenAPIHono } from "@hono/zod-openapi"
import { jwt } from "hono/jwt"
import { LeaderboardController } from "./controllers/leaderboard/leaderboard.controller"
import { AdminController } from "./controllers/admin/admin.controller"
import { swaggerUI } from "@hono/swagger-ui"
import { logger } from "hono/logger"
import { getDb, type Database } from "./utils"

type Bindings = {
	DB: any
	JWT_SECRET: string
	ADMIN_USERNAME: string
	ADMIN_PASSWORD: string
}

type Variables = {
	db: Database
}

export const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

app.use("*", logger((str, ...rest) => {
	const [dir, method, path, status, ms, error] = str.split(" ")
	if (dir?.startsWith("-->")) {
		if (status !== "200") {
			console.log(`${method} ${path} ${status} ${ms}${error ? ` - ${error}` : ""}`)
		}
	}
}))

// IP logging middleware
app.use("*", async (c, next) => {
	const ip = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown"
	console.log(`[${new Date().toISOString()}] ${ip} - ${c.req.method} ${c.req.path}`)
	await next()
})

// Initialize database in context
app.use("*", async (c, next) => {
	c.set("db", getDb(c.env.DB))
	await next()
})

// Mount admin routes first (without JWT protection on sign endpoint)
app.route("/admin", AdminController)

// JWT middleware for all routes except /admin/sign, /swagger, and /docs
app.use("/leaderboard/*", async (c, next) => {
	try {
		const JWT_SECRET = c.env.JWT_SECRET || "default-secret-change-in-production"
		return await jwt({ secret: JWT_SECRET, alg: "HS256" })(c, next)
	} catch (error) {
		return c.json({ error: "Forbidden - Invalid or missing token" }, 403)
	}
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

export default app
