// playwright.config.js
// This config is set up for API testing only (no browsers needed).
// Playwright's "request" fixture lets us send HTTP requests and assert on responses.

require('dotenv').config({ quiet: true }); // suppress dotenv's promotional console tips
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,            // fail a test if it takes longer than 30s
  fullyParallel: true,           // run test files in parallel for speed
  retries: 1,                    // retry once on failure (helps with flaky network calls)
  reporter: [
    ['list'],                    // clean console output
    ['html', { open: 'never' }], // generates a shareable HTML report in playwright-report/
  ],
  use: {
    baseURL: 'https://reqres.in/api/', // the public API we're testing against
    extraHTTPHeaders: {
      'Accept': 'application/json',
      // ReqRes requires a free API key (sign up at https://reqres.in/signup)
      'x-api-key': process.env.REQRES_API_KEY || '',
    },
  },
});