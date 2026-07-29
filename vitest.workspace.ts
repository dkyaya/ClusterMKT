import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      { test: { name: "core", root: "packages/core", environment: "node" } },
      { test: { name: "config", root: "packages/config", environment: "node" } },
      {
        test: {
          name: "ui",
          root: "packages/ui",
          environment: "jsdom",
          setupFiles: ["src/test/setup.ts"],
        },
      },
      {
        test: {
          name: "web",
          root: "apps/web",
          environment: "jsdom",
          setupFiles: ["src/test/setup.ts"],
        },
      },
      { test: { name: "worker", root: "apps/worker", environment: "node" } },
      {
        test: {
          name: "source-intelligence",
          root: "tests/source-intelligence",
          environment: "node",
        },
      },
      {
        test: {
          name: "source-normalization",
          root: "tests/source-normalization",
          environment: "node",
        },
      },
      {
        test: {
          name: "entity-resolution",
          root: "tests/entity-resolution",
          environment: "node",
        },
      },
      {
        test: {
          name: "event-boundaries",
          root: "tests/event-boundaries",
          environment: "node",
        },
      },
    ],
  },
});
