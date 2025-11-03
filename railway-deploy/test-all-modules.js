#!/usr/bin/env node

/**
 * Test Complet de Tous les Modules BMS
 * Valide que chaque endpoint backend fonctionne
 */

require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');

const API_URL = process.env.API_URL || 'https://bms-production-d9e9.up.railway.app';
const COMPANY_ID = '1805bc61-7cfd-44e9-8a63-17187bf05dc7';

// Liste des tests par module
const moduleTests = {
  'Health': [
    { name: 'Health Check', method: 'GET', url: '/health' }
  ],
  
  'Accounting': [
    { name: 'Trial Balance', method: 'GET', url: `/api/v1/accounting/trial-balance?companyId=${COMPANY_ID}` },
    { name: 'Profit & Loss', method: 'GET', url: `/api/v1/accounting/profit-loss?companyId=${COMPANY_ID}` },
    { name: 'Balance Sheet', method: 'GET', url: `/api/v1/accounting/balance-sheet?companyId=${COMPANY_ID}` },
    { name: 'General Ledger', method: 'GET', url: `/api/v1/accounting/general-ledger?companyId=${COMPANY_ID}` },
    { name: 'Chart of Accounts', method: 'GET', url: `/api/v1/accounting/chart-of-accounts?companyId=${COMPANY_ID}` },
    { name: 'Closure Preview', method: 'GET', url: `/api/v1/accounting/closure/preview?companyId=${COMPANY_ID}&period=2025-10` },
    { name: 'Aged Balance', method: 'GET', url: `/api/v1/accounting/aged-balance?companyId=${COMPANY_ID}` }
  ],
  
  'Treasury': [
    { name: 'Forecast', method: 'GET', url: `/api/v1/treasury/forecast?companyId=${COMPANY_ID}` },
    { name: 'Alerts', method: 'GET', url: `/api/v1/treasury/alerts?companyId=${COMPANY_ID}` },
    { name: 'Direct Debits', method: 'GET', url: `/api/v1/treasury/direct-debits?companyId=${COMPANY_ID}` },
    { name: 'Direct Debits Stats', method: 'GET', url: '/api/v1/treasury/direct-debits/statistics' }
  ],
  
  'Banking': [
    { name: 'Transactions', method: 'GET', url: `/api/v1/banking/transactions?companyId=${COMPANY_ID}` },
    { name: 'History', method: 'GET', url: `/api/v1/banking/history?companyId=${COMPANY_ID}&limit=50` }
  ],
  
  'Tax': [
    { name: 'VAT Return', method: 'GET', url: `/api/v1/tax/vat/return?companyId=${COMPANY_ID}&startDate=2025-01-01&endDate=2025-10-31` }
  ],
  
  'CRM': [
    { name: 'Dashboard', method: 'GET', url: `/api/v1/crm/dashboard?companyId=${COMPANY_ID}` },
    { name: 'Contacts', method: 'GET', url: `/api/v1/crm/contacts?companyId=${COMPANY_ID}` },
    { name: 'Opportunities Stages', method: 'GET', url: '/api/crm/opportunities/pipeline/stages' }
  ],
  
  'HR': [
    { name: 'Employees', method: 'GET', url: `/api/v1/hr/employees?companyId=${COMPANY_ID}` },
    { name: 'Payroll', method: 'GET', url: `/api/v1/hr/payroll?companyId=${COMPANY_ID}` },
    { name: 'Dashboard', method: 'GET', url: `/api/v1/hr/dashboard?companyId=${COMPANY_ID}` },
    { name: 'Timesheets', method: 'GET', url: `/api/hr/timesheets?companyId=${COMPANY_ID}` }
  ],
  
  'Payments': [
    { name: 'List', method: 'GET', url: `/api/v1/payments?companyId=${COMPANY_ID}` },
    { name: 'Stats', method: 'GET', url: `/api/v1/payments/stats?companyId=${COMPANY_ID}` }
  ],
  
  'Sales': [
    { name: 'Dashboard', method: 'GET', url: `/api/v1/sales/dashboard?companyId=${COMPANY_ID}` },
    { name: 'Quotes', method: 'GET', url: `/api/v1/sales/quotes?companyId=${COMPANY_ID}` },
    { name: 'Orders', method: 'GET', url: `/api/v1/sales/orders?companyId=${COMPANY_ID}` },
    { name: 'Clients', method: 'GET', url: `/api/v1/sales/clients?companyId=${COMPANY_ID}` }
  ],
  
  'Marketing': [
    { name: 'Dashboard', method: 'GET', url: `/api/v1/marketing/dashboard?companyId=${COMPANY_ID}` },
    { name: 'Campaigns', method: 'GET', url: `/api/v1/marketing/campaigns?companyId=${COMPANY_ID}` }
  ],
  
  'Communications': [
    { name: 'Templates', method: 'GET', url: `/api/v1/communications/templates?companyId=${COMPANY_ID}` },
    { name: 'SMS', method: 'GET', url: `/api/v1/communications/sms?companyId=${COMPANY_ID}` },
    { name: 'Emails', method: 'GET', url: `/api/v1/communications/emails?companyId=${COMPANY_ID}` },
    { name: 'Stats', method: 'GET', url: `/api/v1/communications/stats?companyId=${COMPANY_ID}` }
  ],
  
  'Inventory': [
    { name: 'Items', method: 'GET', url: `/api/v1/inventory/items?companyId=${COMPANY_ID}` }
  ],
  
  'Projects': [
    { name: 'List', method: 'GET', url: `/api/v1/projects?companyId=${COMPANY_ID}` },
    { name: 'Dashboard', method: 'GET', url: `/api/v1/projects/dashboard?companyId=${COMPANY_ID}` }
  ],
  
  'Purchases': [
    { name: 'Suppliers', method: 'GET', url: `/api/v1/purchases/suppliers?companyId=${COMPANY_ID}` },
    { name: 'Orders', method: 'GET', url: `/api/v1/purchases/orders?companyId=${COMPANY_ID}` },
    { name: 'RFQ', method: 'GET', url: `/api/v1/purchases/rfq?companyId=${COMPANY_ID}` }
  ],
  
  'Manufacturing': [
    { name: 'BOM', method: 'GET', url: `/api/v1/manufacturing/bom?companyId=${COMPANY_ID}` },
    { name: 'Production Orders', method: 'GET', url: `/api/v1/manufacturing/production-orders?companyId=${COMPANY_ID}` }
  ],
  
  'Mobile Money': [
    { name: 'Transactions', method: 'GET', url: `/api/v1/mobile-money/transactions?companyId=${COMPANY_ID}` },
    { name: 'Stats', method: 'GET', url: `/api/v1/mobile-money/stats?companyId=${COMPANY_ID}` }
  ]
};

async function testEndpoint(test) {
  try {
    const response = await axios({
      method: test.method,
      url: `${API_URL}${test.url}`,
      timeout: 5000,
      validateStatus: () => true // Accept all status codes
    });
    
    return {
      ...test,
      status: response.status,
      success: response.status >= 200 && response.status < 300,
      error: response.status >= 400 ? response.data : null
    };
  } catch (error) {
    return {
      ...test,
      status: 0,
      success: false,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           🔍 TEST COMPLET MODULES BMS - PRODUCTION           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log(`📍 API URL: ${API_URL}\n`);
  
  const results = {};
  let totalTests = 0;
  let totalSuccess = 0;
  let totalFailed = 0;
  
  for (const [moduleName, tests] of Object.entries(moduleTests)) {
    console.log(`\n━━━ 📦 Module: ${moduleName} ━━━`);
    
    const moduleResults = [];
    
    for (const test of tests) {
      const result = await testEndpoint(test);
      moduleResults.push(result);
      totalTests++;
      
      if (result.success) {
        totalSuccess++;
        console.log(`  ✅ ${test.name} - ${result.status}`);
      } else {
        totalFailed++;
        console.log(`  ❌ ${test.name} - ${result.status} ${result.error ? `(${typeof result.error === 'string' ? result.error : JSON.stringify(result.error).substring(0, 50)})` : ''}`);
      }
    }
    
    results[moduleName] = moduleResults;
  }
  
  // Rapport final
  console.log('\n\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                      📊 RAPPORT FINAL                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  const successRate = ((totalSuccess / totalTests) * 100).toFixed(1);
  console.log(`Tests totaux:     ${totalTests}`);
  console.log(`✅ Succès:        ${totalSuccess}`);
  console.log(`❌ Échecs:        ${totalFailed}`);
  console.log(`🎯 Taux succès:   ${successRate}%\n`);
  
  // Modules avec problèmes
  console.log('━━━ ⚠️  MODULES AVEC PROBLÈMES ━━━\n');
  for (const [moduleName, moduleResults] of Object.entries(results)) {
    const failed = moduleResults.filter(r => !r.success);
    if (failed.length > 0) {
      console.log(`❌ ${moduleName}: ${failed.length}/${moduleResults.length} échecs`);
      failed.forEach(f => {
        console.log(`   - ${f.name}: ${f.status} ${f.error ? `(${typeof f.error === 'string' ? f.error : 'Error'})` : ''}`);
      });
    }
  }
  
  // Sauvegarder résultats
  const fs = require('fs');
  fs.writeFileSync(
    'test-modules-results.json',
    JSON.stringify({ 
      timestamp: new Date().toISOString(),
      apiUrl: API_URL,
      summary: { totalTests, totalSuccess, totalFailed, successRate },
      results 
    }, null, 2)
  );
  
  console.log('\n✅ Résultats sauvegardés: test-modules-results.json\n');
  
  process.exit(totalFailed > 0 ? 1 : 0);
}

runTests();
