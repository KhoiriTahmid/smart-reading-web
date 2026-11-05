import { defineConfig } from "vitest/config";

// Kept separate from vite.config.ts: the React Router plugin is only needed
// for dev/build, and it does not run inside Vitest.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["app/**/*.test.{ts,tsx}"],
    restoreMocks: true,
    css: false,
    // Tests must not depend on the local .env (API URL, mock mode).
    env: { VITE_API_URL: "", VITE_USE_MOCK: "false" },
  },
});
