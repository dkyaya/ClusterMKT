import type { Env } from "./env";
import { healthResponse } from "./routes/health";
import { statusResponse } from "./routes/status";

export function handleRequest(request: Request, env: Env = {}): Response {
  const { pathname } = new URL(request.url);
  if (request.method !== "GET")
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  if (pathname === "/health") return healthResponse(env);
  if (pathname === "/api/status") return statusResponse(env);
  return Response.json({ error: "Not found" }, { status: 404 });
}
