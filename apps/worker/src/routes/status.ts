import { APPLICATION_NAME } from "@cluster-mkt/config";
import type { Env } from "../env";

export function statusResponse(env: Env): Response {
  return Response.json({
    application: APPLICATION_NAME,
    foundationStatus: "application-foundation",
    liveDataConnected: false,
    authenticationConnected: false,
    externalAiConnected: false,
    buildLabel: env.BUILD_LABEL ?? "local-development",
  });
}
