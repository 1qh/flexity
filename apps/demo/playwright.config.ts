import { defineConfig } from '@playwright/test'
export default defineConfig({
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  testDir: 'e2e',
  use: {
    baseURL: 'http://localhost:3200'
  },
  webServer: {
    command: 'bun run dev',
    port: 3200,
    reuseExistingServer: true
  }
})
