import { handleRequest } from "./app";
import type { Env } from "./env";

export default {
  fetch(request: Request, env: Env): Response {
    return handleRequest(request, env);
  },
};
