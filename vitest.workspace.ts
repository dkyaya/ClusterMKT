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
      {
        test: {
          name: "story-clusters",
          root: "tests/story-clusters",
          environment: "node",
        },
      },
      {
        test: {
          name: "claims",
          root: "tests/claims",
          environment: "node",
        },
      },
      {
        test: {
          name: "agreement-disagreement",
          root: "tests/agreement-disagreement",
          environment: "node",
        },
      },
      {
        test: {
          name: "provenance",
          root: "tests/provenance",
          environment: "node",
        },
      },
      { test: { name: "source-registry", root: "tests/source-registry", environment: "node" } },
      { test: { name: "adapters", root: "tests/adapters", environment: "node" } },
      {
        test: {
          name: "ingestion-idempotency",
          root: "tests/ingestion-idempotency",
          environment: "node",
        },
      },
      {
        test: {
          name: "ingestion-retries",
          root: "tests/ingestion-retries",
          environment: "node",
        },
      },
      {
        test: {
          name: "ingestion-reconciliation",
          root: "tests/ingestion-reconciliation",
          environment: "node",
        },
      },
      {
        test: {
          name: "ingestion-resume",
          root: "tests/ingestion-resume",
          environment: "node",
        },
      },
      {
        test: {
          name: "ingestion-end-to-end",
          root: "tests/ingestion-end-to-end",
          environment: "node",
        },
      },
    ],
  },
});
