import { defineConfig } from '@playwright/test'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const apiLog = path.resolve(import.meta.dirname, '.artifacts/api.log')

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 1,
  timeout: 30_000,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  outputDir: '.artifacts/test-results',
  webServer: [
    {
      command: `java -jar ${root}/api/target/api-0.0.1-SNAPSHOT.jar --logging.level.com.digisec=DEBUG > ${apiLog} 2>&1`,
      url: 'http://localhost:8080/actuator/health',
      reuseExistingServer: false,
      timeout: 90_000,
      env: {
        DB_USERNAME: 'digisec',
        DB_PASSWORD: 'digisec',
        JWT_SECRET: 'e2e-run-secret-key-with-at-least-32-bytes!',
        SEED_ADMIN: 'true',
        ADMIN_EMAIL: 'admin@digisec.local',
        ADMIN_PASSWORD: 'ChangeMe123!',
      },
    },
    {
      command: `npm run preview --prefix ${root}/ui -- --port 4173 --strictPort`,
      url: 'http://localhost:4173',
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
})
