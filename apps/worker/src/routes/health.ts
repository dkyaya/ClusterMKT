import type { Env } from "../env";

export function healthResponse(env: Env, now = new Date()): Response {
  return Response.json({
    status: "ok",
    service: "cluster-mkt-worker",
    timestamp: now.toISOString(),
    environment: env.ENVIRONMENT ?? "local",
  });
}
