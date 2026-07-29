import { describe, expect, it } from "vitest";
import { handleRequest } from "../src/app";

describe("Worker routing", () => {
  it("returns structured health JSON", async () => {
    const response = handleRequest(new Request("https://cluster.test/health"), {
      ENVIRONMENT: "test",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      status: "ok",
      service: "cluster-mkt-worker",
      environment: "test",
    });
  });
  it("reports disconnected services", async () => {
    const response = handleRequest(new Request("https://cluster.test/api/status"));
    await expect(response.json()).resolves.toMatchObject({
      liveDataConnected: false,
      authenticationConnected: false,
      externalAiConnected: false,
    });
  });
  it("returns 404 for an unknown route", () => {
    expect(handleRequest(new Request("https://cluster.test/unknown")).status).toBe(404);
  });
});
