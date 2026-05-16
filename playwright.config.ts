import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  use: {
    baseURL: "http://127.0.0.1:8090",
    trace: "on-first-retry",
  },
  webServer: {
    command:
      process.platform === "win32"
        ? ".venv\\Scripts\\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8090"
        : ".venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8090",
    cwd: __dirname,
    url: "http://127.0.0.1:8090/health",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
