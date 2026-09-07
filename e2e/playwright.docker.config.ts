import { defineConfig } from '@playwright/test'

// Docker-stack profile: tests run against `docker compose up` services
// (nginx on :80 serving the built UI, api on :8080). No webServer here —
// e2e/run-docker.sh boots the stack and tails the api log first.
export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 1,
  timeout: 30_000,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  outputDir: '.artifacts/test-results',
})
