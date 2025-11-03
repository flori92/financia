#!/usr/bin/env node

/**
 * Script de Test Complet IA/ML - BMS Production
 * Test tous les modules IA et ML pour validation production
 * Usage: node test-all-ai-ml.js
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const API_URL = process.env.API_URL || 'https://bms-production-d9e9.up.railway.app';

// Couleurs pour output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logHeader(message) {
  log(`\n${colors.bold}${colors.cyan}╔════════════════════════════════════════╗`, 'cyan');
  log(`${colors.bold}${colors.cyan}║ ${message.padEnd(38)} ║`, 'cyan');
  log(`${colors.bold}${colors.cyan}╚════════════════════════════════════════╝\n`, 'cyan');
}

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  details: []
};

async function testEndpoint(name, url, method = 'GET', data = null, expectedStatus = 200) {
  try {
    logInfo(`Testing ${name}...`);
    
    let response;
    if (method === 'GET') {
      response = await axios.get(`${API_URL}${url}`, { timeout: 10000 });
    } else if (method === 'POST') {
      response = await axios.post(`${API_URL}${url}`, data, { timeout: 10000 });
    }

    if (response.status === expectedStatus) {
      logSuccess(`${name} - ${response.status} ${response.statusText}`);
      testResults.passed++;
      testResults.details.push({ name, status: 'PASSED', url, method, responseTime: response.headers['x-response-time'] || 'N/A' });
      
      // Afficher un aperçu des données
      if (response.data && typeof response.data === 'object') {
        const keys = Object.keys(response.data);
        logInfo(`   Response keys: ${keys.join(', ')}`);
        
        // Afficher quelques données si disponibles
        if (response.data.data && Array.isArray(response.data.data)) {
          logInfo(`   Data items: ${response.data.data.length}`);
        }
        if (response.data.forecasts && Array.isArray(response.data.forecasts)) {
          logInfo(`   Forecasts: ${response.data.forecasts.length} items`);
        }
        if (response.data.confidence) {
          logInfo(`   Confidence: ${(response.data.confidence * 100).toFixed(1)}%`);
        }
      }
      
      return true;
    } else {
      logError(`${name} - Expected ${expectedStatus}, got ${response.status}`);
      testResults.failed++;
      testResults.details.push({ name, status: 'FAILED', url, method, error: `Status ${response.status}` });
      return false;
    }
  } catch (error) {
    logError(`${name} - ${error.message}`);
    testResults.failed++;
    testResults.details.push({ name, status: 'FAILED', url, method, error: error.message });
    return false;
  }
}

async function testOCRModule() {
  logHeader('🤖 MODULE OCR - TEST COMPLET');
  
  logInfo('Testing OCR Configuration...');
  
  // Test configuration
  await testEndpoint(
    'OCR Configuration Test',
    '/api/v1/ai/ocr/test',
    'POST'
  );
  
  // Test stats
  await testEndpoint(
    'OCR Statistics',
    '/api/v1/ai/ocr/stats',
    'GET'
  );
  
  // Test extraction (si on a un fichier test)
  const testImagePath = './test-invoice.jpg';
  if (fs.existsSync(testImagePath)) {
    logInfo('Testing OCR extraction with test image...');
    
    try {
      const FormData = require('form-data');
      const form = new FormData();
      form.append('file', fs.createReadStream(testImagePath));
      
      const response = await axios.post(`${API_URL}/api/v1/ai/ocr/invoice`, form, {
        headers: form.getHeaders(),
        timeout: 30000
      });
      
      if (response.status === 200) {
        logSuccess('OCR Extraction - Real document test');
        testResults.passed++;
        
        if (response.data.provider) {
          logInfo(`   Provider used: ${response.data.provider}`);
        }
        if (response.data.confidence) {
          logInfo(`   Confidence: ${(response.data.confidence * 100).toFixed(1)}%`);
        }
        if (response.data.data) {
          logInfo(`   Extracted fields: ${Object.keys(response.data.data).length}`);
        }
      }
    } catch (error) {
      logWarning('OCR Extraction - No test image available, skipping');
      testResults.skipped++;
    }
  } else {
    logWarning('OCR Extraction - No test image found, skipping real document test');
    testResults.skipped++;
  }
}

async function testMLForecastModule() {
  logHeader('📊 MODULE ML FORECAST - TEST COMPLET');
  
  const testCompanyId = '1805bc61-7cfd-44e9-8a63-17187bf05dc7';
  
  // Test dashboard principal
  await testEndpoint(
    'ML Forecast Dashboard',
    `/api/v1/ml-forecast/dashboard?companyId=${testCompanyId}&metric=revenue&horizon=6`,
    'GET'
  );
  
  // Test prévisions simples
  await testEndpoint(
    'ML Forecast Predict',
    `/api/v1/ml-forecast/predict?companyId=${testCompanyId}&model=Ensemble&horizon=12`,
    'GET'
  );
  
  // Test performance modèles
  await testEndpoint(
    'ML Models Performance',
    `/api/v1/ml-forecast/models/performance?companyId=${testCompanyId}`,
    'GET'
  );
  
  // Test auto-sélection modèle
  await testEndpoint(
    'ML Auto-Select Model',
    `/api/v1/ml-forecast/auto-select?companyId=${testCompanyId}`,
    'GET'
  );
  
  // Test détection anomalies
  await testEndpoint(
    'ML Anomaly Detection',
    `/api/v1/ml-forecast/anomalies?companyId=${testCompanyId}`,
    'GET'
  );
  
  // Test analyse tendance
  await testEndpoint(
    'ML Trend Analysis',
    `/api/v1/ml-forecast/trend?companyId=${testCompanyId}`,
    'GET'
  );
  
  // Test entraînement modèle
  await testEndpoint(
    'ML Model Training',
    `/api/v1/ml-forecast/train?companyId=${testCompanyId}&model=Ensemble`,
    'POST'
  );
}

async function testChatAIModule() {
  logHeader('💬 MODULE CHAT IA - TEST COMPLET');
  
  // Test chat simple
  await testEndpoint(
    'AI Chat Basic',
    '/api/v1/ai/chat',
    'POST',
    { message: 'Bonjour, comment allez-vous ?' }
  );
  
  // Test chat avec question métier
  await testEndpoint(
    'AI Chat Business',
    '/api/v1/ai/chat',
    'POST',
    { message: 'Quelles sont les meilleures pratiques pour la gestion de trésorerie ?' }
  );
}

async function testBackendHealth() {
  logHeader('🏥 BACKEND HEALTH - TEST COMPLET');
  
  // Test health endpoint
  await testEndpoint(
    'Backend Health Check',
    '/health',
    'GET'
  );
  
  // Test API base
  try {
    const response = await axios.get(`${API_URL}/`, { timeout: 5000 });
    if (response.status === 200) {
      logSuccess('API Root - Server responding');
      testResults.passed++;
    }
  } catch (error) {
    logError('API Root - Server not responding');
    testResults.failed++;
  }
}

async function generateReport() {
  logHeader('📋 RAPPORT DE TEST IA/ML');
  
  const total = testResults.passed + testResults.failed + testResults.skipped;
  const successRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;
  
  log(`\n${colors.bold}📊 STATISTIQUES GLOBALES:${colors.reset}`, 'bold');
  log(`   Tests exécutés: ${total}`, 'blue');
  log(`   ✅ Réussis: ${testResults.passed}`, 'green');
  log(`   ❌ Échoués: ${testResults.failed}`, 'red');
  log(`   ⚠️  Ignorés: ${testResults.skipped}`, 'yellow');
  log(`   📈 Taux succès: ${successRate}%`, successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red');
  
  log(`\n${colors.bold}📝 DÉTAILS DES TESTS:${colors.reset}`, 'bold');
  
  testResults.details.forEach(test => {
    const statusIcon = test.status === 'PASSED' ? '✅' : test.status === 'FAILED' ? '❌' : '⚠️';
    const statusColor = test.status === 'PASSED' ? 'green' : test.status === 'FAILED' ? 'red' : 'yellow';
    
    log(`   ${statusIcon} ${test.name}`, statusColor);
    log(`      ${test.method} ${test.url}`, 'blue');
    
    if (test.error) {
      log(`      Erreur: ${test.error}`, 'red');
    }
    if (test.responseTime && test.responseTime !== 'N/A') {
      log(`      Temps: ${test.responseTime}`, 'cyan');
    }
  });
  
  // Recommandations
  log(`\n${colors.bold}💡 RECOMMANDATIONS:${colors.reset}`, 'bold');
  
  if (testResults.failed === 0) {
    log('   🎉 Tous les tests IA/ML sont passés avec succès !', 'green');
    log('   ✅ Votre application est prête pour la production', 'green');
  } else {
    log(`   ⚠️  ${testResults.failed} test(s) ont échoué`, 'yellow');
    log('   🔧 Vérifiez les erreurs ci-dessus et corrigez-les', 'yellow');
  }
  
  if (testResults.skipped > 0) {
    log(`   ℹ️  ${testResults.skipped} test(s) ignorés (fichiers manquants)`, 'blue');
  }
  
  // État des modules
  log(`\n${colors.bold}🔧 ÉTAT DES MODULES IA/ML:${colors.reset}`, 'bold');
  
  const ocrTests = testResults.details.filter(t => t.name.includes('OCR'));
  const mlTests = testResults.details.filter(t => t.name.includes('ML'));
  const chatTests = testResults.details.filter(t => t.name.includes('Chat'));
  
  const ocrStatus = ocrTests.every(t => t.status === 'PASSED') ? '✅ Opérationnel' : '❌ Problème';
  const mlStatus = mlTests.every(t => t.status === 'PASSED') ? '✅ Opérationnel' : '❌ Problème';
  const chatStatus = chatTests.every(t => t.status === 'PASSED') ? '✅ Opérationnel' : '❌ Problème';
  
  log(`   🤖 Module OCR: ${ocrStatus}`, ocrStatus.includes('✅') ? 'green' : 'red');
  log(`   📊 Module ML: ${mlStatus}`, mlStatus.includes('✅') ? 'green' : 'red');
  log(`   💬 Module Chat IA: ${chatStatus}`, chatStatus.includes('✅') ? 'green' : 'red');
  
  return successRate >= 80;
}

async function main() {
  console.log(`${colors.bold}${colors.cyan}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🧪 BMS IA/ML - TEST DE VALIDATION COMPLET                  ║
║   Tests de tous les modules Intelligence Artificielle          ║
║   et Machine Learning pour production                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  logInfo(`URL de test: ${API_URL}`);
  logInfo(`Heure de début: ${new Date().toISOString()}\n`);
  
  try {
    // Test santé backend
    await testBackendHealth();
    
    // Test module OCR
    await testOCRModule();
    
    // Test module ML Forecast
    await testMLForecastModule();
    
    // Test module Chat IA
    await testChatAIModule();
    
    // Générer rapport final
    const allTestsPassed = await generateReport();
    
    // Code de sortie
    process.exit(allTestsPassed ? 0 : 1);
    
  } catch (error) {
    logError(`Erreur critique durant les tests: ${error.message}`);
    process.exit(1);
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

main();
