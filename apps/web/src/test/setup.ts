import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      addEventListener: () => undefined,
      dispatchEvent: () => false,
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: () => undefined,
    }),
  });
}

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (callback) => {
    callback(0);
    return 0;
  };
}

afterEach(cleanup);
