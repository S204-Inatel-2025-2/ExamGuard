import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      require('mochawesome/plugin')(on);
    },
  },
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: true,
    json: true,
    charts: true,
    reportPageTitle: 'Relatório de testes E2E',
    embeddedScreenshots: true,
    inlineAssets: true
  },
  viewportWidth: 1280,
  viewportHeight: 720,
  video: true,
  screenshotOnRunFailure: true,
})