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
    ],
  },
});
