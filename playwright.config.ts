// End-to-end i Chromium (Edge-motorn) och WebKit (Safari-motorn) mot den byggda filen (ADR-009).
import { defineConfig, devices } from '@playwright/test'

const lokalChromium = process.env.PW_CHROMIUM_PATH
export default defineConfig({
  testDir: 'tests/e2e',
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://localhost:4173', trace: 'off' },
  webServer: { command: 'npm run preview', url: 'http://localhost:4173', reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 }, launchOptions: lokalChromium ? { executablePath: lokalChromium } : {} } },
    ...(process.env.UTAN_WEBKIT ? [] : [{ name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 720 } } }]),
  ],
})
