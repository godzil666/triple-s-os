import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/domain/**','**/server/**'],
  outputDir: 'test-results',
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: process.env.EVIDENCE_DIR ? `${process.env.EVIDENCE_DIR}/browser-results.json` : 'test-results/browser-results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:5174',
    browserName: 'chromium',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {},
    screenshot: 'only-on-failure', trace: 'retain-on-failure',
  },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:5174/api/health', reuseExistingServer: !process.env.CI, env: { SSS_WEB_PORT:'5174', SSS_API_PORT:'8788', SSS_DATA_DIR:'.local/auth-browser-tests' } },
})
