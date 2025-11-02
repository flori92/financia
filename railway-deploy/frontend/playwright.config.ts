/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour tests E2E BMS
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  // Timeout global pour les tests
  timeout: 30 * 1000,
  
  // Timeout pour les assertions expect
  expect: {
    timeout: 5000,
  },
  
  // Réessayer les tests qui échouent
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  
  // Workers parallèles
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results.json' }],
  ],
  
  // Configuration globale des tests
  use: {
    // URL de base
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Screenshots on failure
    screenshot: 'only-on-failure',
    
    // Videos on failure
    video: 'retain-on-failure',
    
    // Traces
    trace: 'on-first-retry',
  },

  // Projets de test
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Tests mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Serveur web local (optionnel)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
