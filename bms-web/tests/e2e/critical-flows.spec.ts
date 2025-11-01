/// <reference types="node" />
import { test, expect } from '@playwright/test';

/**
 * Tests E2E - Flux Critiques BMS
 * 
 * Couvre les parcours utilisateurs essentiels :
 * 1. Authentification
 * 2. Création facture
 * 3. Gestion trésorerie
 * 4. Prélèvements automatiques
 * 5. Comptabilité OHADA
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:3001';

test.describe('Authentication', () => {
  test('should login as entrepreneur', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('input[type="email"]', 'entrepreneur@test.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(`${BASE_URL}/`);
    await expect(page.locator('text=Tableau de bord')).toBeVisible();
  });

  test('should login as accountant', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('input[type="email"]', 'accountant@test.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(`${BASE_URL}/accountant`);
    await expect(page.locator('text=Dashboard Comptable')).toBeVisible();
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Identifiants incorrects')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'entrepreneur@test.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Déconnexion');
    
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });
});

test.describe('Invoice Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'entrepreneur@test.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
  });

  test('should create a new invoice', async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices`);
    await page.click('text=Nouvelle facture');
    
    // Fill invoice details
    await page.selectOption('select[name="customerId"]', { index: 1 });
    await page.fill('input[name="invoiceNumber"]', `INV-TEST-${Date.now()}`);
    await page.fill('input[name="issueDate"]', '2025-11-01');
    await page.fill('input[name="dueDate"]', '2025-11-30');
    
    // Add line item
    await page.click('text=Ajouter une ligne');
    await page.fill('input[name="lineItems[0].description"]', 'Service Test');
    await page.fill('input[name="lineItems[0].quantity"]', '1');
    await page.fill('input[name="lineItems[0].unitPrice"]', '50000');
    
    // Submit
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Facture créée avec succès')).toBeVisible();
  });

  test('should validate invoice totals', async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices`);
    await page.click('text=Nouvelle facture');
    
    await page.fill('input[name="lineItems[0].quantity"]', '2');
    await page.fill('input[name="lineItems[0].unitPrice"]', '25000');
    
    // Check HT calculation
    const htAmount = await page.locator('[data-testid="amount-ht"]').textContent();
    expect(htAmount).toContain('50 000');
    
    // Check TTC with VAT
    const ttcAmount = await page.locator('[data-testid="amount-ttc"]').textContent();
    expect(ttcAmount).toContain('59 000'); // 50000 * 1.18
  });

  test('should send invoice by email', async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices`);
    
    // Click first invoice
    await page.click('tbody tr:first-child');
    
    // Send email
    await page.click('text=Envoyer par email');
    await page.fill('input[name="recipientEmail"]', 'client@test.com');
    await page.click('button:has-text("Envoyer")');
    
    await expect(page.locator('text=Email envoyé avec succès')).toBeVisible();
  });
});

test.describe('Treasury Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'entrepreneur@test.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
  });

  test('should display treasury dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/treasury`);
    
    await expect(page.locator('text=Solde actuel')).toBeVisible();
    await expect(page.locator('text=Runway')).toBeVisible();
    await expect(page.locator('text=Prévisions')).toBeVisible();
  });

  test('should show treasury alerts', async ({ page }) => {
    await page.goto(`${BASE_URL}/treasury`);
    
    const alertsSection = page.locator('[data-testid="treasury-alerts"]');
    await expect(alertsSection).toBeVisible();
  });

  test('should export treasury data to CSV', async ({ page }) => {
    await page.goto(`${BASE_URL}/treasury`);
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Exporter CSV');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/tresorerie.*\.csv/);
  });
});

test.describe('Direct Debits', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'entrepreneur@test.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
  });

  test('should create a new direct debit', async ({ page }) => {
    await page.goto(`${BASE_URL}/entrepreneur/direct-debits`);
    await page.click('text=Nouveau prélèvement');
    
    // Fill form
    await page.fill('input[name="mandateReference"]', `SEPA-${Date.now()}`);
    await page.fill('input[name="label"]', 'Loyer Bureau');
    await page.fill('input[name="creditor"]', 'Immobilière Cotonou');
    await page.fill('input[name="amount"]', '200000');
    await page.selectOption('select[name="frequency"]', 'monthly');
    await page.fill('input[name="dayOfMonth"]', '5');
    await page.fill('input[name="startDate"]', '2025-11-01');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Prélèvement créé avec succès')).toBeVisible();
  });

  test('should suspend a direct debit', async ({ page }) => {
    await page.goto(`${BASE_URL}/entrepreneur/direct-debits`);
    
    // Find active debit and suspend it
    const firstRow = page.locator('tbody tr:first-child');
    await firstRow.locator('[title="Suspendre"]').click();
    
    // Verify status changed
    await expect(firstRow.locator('text=Suspendu')).toBeVisible();
  });

  test('should display statistics correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/entrepreneur/direct-debits`);
    
    await expect(page.locator('text=Total')).toBeVisible();
    await expect(page.locator('text=Actifs')).toBeVisible();
    await expect(page.locator('text=Mensuel')).toBeVisible();
  });

  test('should validate debit form inputs', async ({ page }) => {
    await page.goto(`${BASE_URL}/entrepreneur/direct-debits`);
    await page.click('text=Nouveau prélèvement');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Check validation messages
    const validationMessages = page.locator('text=Champ obligatoire');
    await expect(validationMessages.first()).toBeVisible();
  });
});

test.describe('Accounting OHADA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'accountant@test.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
  });

  test('should display chart of accounts', async ({ page }) => {
    await page.goto(`${BASE_URL}/accountant/chart-of-accounts`);
    
    await expect(page.locator('text=Plan Comptable SYSCOHADA')).toBeVisible();
    await expect(page.locator('text=Classe 1')).toBeVisible();
    await expect(page.locator('text=Classe 7')).toBeVisible();
  });

  test('should filter accounts by class', async ({ page }) => {
    await page.goto(`${BASE_URL}/accountant/chart-of-accounts`);
    
    await page.click('button:has-text("Classe 7")');
    
    // Should only show class 7 accounts
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
    const firstAccount = await page.locator('tbody tr:first-child td:first-child').textContent();
    expect(firstAccount).toMatch(/^7/);
  });

  test('should create journal entry', async ({ page }) => {
    await page.goto(`${BASE_URL}/accountant/journal`);
    await page.click('text=Nouvelle écriture');
    
    // Fill entry details
    await page.fill('input[name="date"]', '2025-11-01');
    await page.fill('input[name="description"]', 'Vente marchandises');
    
    // Debit line
    await page.selectOption('select[name="lines[0].account"]', '411'); // Clients
    await page.fill('input[name="lines[0].debit"]', '118000');
    
    // Credit lines
    await page.click('text=Ajouter ligne');
    await page.selectOption('select[name="lines[1].account"]', '707'); // Ventes
    await page.fill('input[name="lines[1].credit"]', '100000');
    
    await page.click('text=Ajouter ligne');
    await page.selectOption('select[name="lines[2].account"]', '4457'); // TVA collectée
    await page.fill('input[name="lines[2].credit"]', '18000');
    
    // Verify balance
    const balance = await page.locator('[data-testid="entry-balance"]').textContent();
    expect(balance).toContain('0'); // Balanced
    
    await page.click('button:has-text("Enregistrer")');
    
    await expect(page.locator('text=Écriture créée avec succès')).toBeVisible();
  });

  test('should generate trial balance', async ({ page }) => {
    await page.goto(`${BASE_URL}/accountant/trial-balance`);
    
    await expect(page.locator('text=Balance de Vérification')).toBeVisible();
    
    // Check totals equal
    const totalDebit = await page.locator('[data-testid="total-debit"]').textContent();
    const totalCredit = await page.locator('[data-testid="total-credit"]').textContent();
    
    expect(totalDebit).toBe(totalCredit);
  });

  test('should export FEC file', async ({ page }) => {
    await page.goto(`${BASE_URL}/accountant`);
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Export FEC');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/FEC.*\.txt/);
  });
});

test.describe('VAT Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'accountant@test.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
  });

  test('should display VAT dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/accountant/tax`);
    
    await expect(page.locator('text=TVA Collectée')).toBeVisible();
    await expect(page.locator('text=TVA Déductible')).toBeVisible();
    await expect(page.locator('text=TVA Nette')).toBeVisible();
  });

  test('should recalculate VAT', async ({ page }) => {
    await page.goto(`${BASE_URL}/accountant/tax`);
    
    await page.click('text=Recalculer TVA');
    
    await expect(page.locator('text=TVA recalculée avec succès')).toBeVisible();
  });

  test('should generate CA3 PDF', async ({ page }) => {
    await page.goto(`${BASE_URL}/accountant/tax`);
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Télécharger CA3');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/CA3.*\.pdf/);
  });
});

test.describe('OCR Document Processing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'accountant@test.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
  });

  test('should upload and process invoice', async ({ page }) => {
    await page.goto(`${BASE_URL}/ai/ocr`);
    
    // Select document type
    await page.click('text=Facture');
    
    // Upload file (requires test file)
    const fileInput = page.locator('input[type="file"]');
    // await fileInput.setInputFiles('./tests/fixtures/test-invoice.pdf');
    
    // Click extract
    await page.click('text=Lancer l\'extraction OCR');
    
    // Wait for processing
    await page.waitForSelector('text=Extraction terminée', { timeout: 30000 });
    
    // Verify extracted data visible
    await expect(page.locator('[data-testid="ocr-result"]')).toBeVisible();
  });

  test('should allow manual editing of OCR data', async ({ page }) => {
    await page.goto(`${BASE_URL}/ai/ocr`);
    
    // After OCR extraction (assuming data loaded)
    await page.fill('input[name="invoiceNumber"]', 'MANUAL-001');
    await page.fill('input[name="amount"]', '75000');
    
    await page.click('text=Valider et créer écriture');
    
    await expect(page.locator('text=Écriture créée avec succès')).toBeVisible();
  });
});

test.describe('Performance Tests', () => {
  test('dashboard should load in under 3 seconds', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'entrepreneur@test.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/`);
    await page.waitForSelector('text=Tableau de bord');
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('large table should render efficiently', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'accountant@test.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/accountant/journal`);
    await page.waitForSelector('tbody tr');
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    expect(loadTime).toBeLessThan(2000);
  });
});

test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'entrepreneur@test.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    
    // Simulate offline
    await page.context().setOffline(true);
    
    await page.goto(`${BASE_URL}/invoices`);
    
    await expect(page.locator('text=Erreur de connexion')).toBeVisible();
  });

  test('should display 404 page for invalid routes', async ({ page }) => {
    await page.goto(`${BASE_URL}/non-existent-page`);
    
    await expect(page.locator('text=404')).toBeVisible();
  });
});
