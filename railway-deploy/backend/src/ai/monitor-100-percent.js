#!/usr/bin/env node

/**
 * Script Monitoring 100% IA/ML - BMS Production
 * Surveillance automatique pour atteindre 100% de succès
 * Usage: node monitor-100-percent.js
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'https://bms-production-d9e9.up.railway.app';

// Couleurs pour output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
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

function showSpinner() {
  const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  
  return setInterval(() => {
    process.stdout.write(`\r${colors.cyan}${spinner[i]}${colors.reset} Vérification déploiement...`);
    i = (i + 1) % spinner.length;
  }, 100);
}

async function testCriticalEndpoints() {
  const tests = [
    { name: 'Backend Health', url: '/health', method: 'GET' },
    { name: 'OCR Stats', url: '/api/v1/ai/ocr/stats', method: 'GET' },
    { name: 'OCR Config', url: '/api/v1/ai/ocr/test', method: 'POST', data: {} },
    { name: 'Chat IA', url: '/api/v1/ai/chat', method: 'POST', data: { message: 'Test monitoring' } },
    { name: 'ML Dashboard', url: '/api/v1/ml-forecast/dashboard?companyId=test&metric=revenue&horizon=6', method: 'GET' },
    { name: 'ML Predict', url: '/api/v1/ml-forecast/predict?companyId=test&model=Ensemble&horizon=6', method: 'GET' },
    { name: 'ML Performance', url: '/api/v1/ml-forecast/models/performance?companyId=test', method: 'GET' }
  ];

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const test of tests) {
    try {
      let response;
      if (test.method === 'GET') {
        response = await axios.get(`${API_URL}${test.url}`, { timeout: 5000 });
      } else {
        response = await axios.post(`${API_URL}${test.url}`, test.data, { timeout: 5000 });
      }

      if (response.status === 200) {
        passed++;
        results.push({ name: test.name, status: '✅' });
      } else {
        failed++;
        results.push({ name: test.name, status: '❌', error: `Status ${response.status}` });
      }
    } catch (error) {
      failed++;
      results.push({ name: test.name, status: '❌', error: error.message });
    }
  }

  return { passed, failed, total: tests.length, results };
}

function showProgress(current, total, message) {
  const percentage = ((current / total) * 100).toFixed(1);
  const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
  
  log(`${colors.bold}${colors.magenta}[${percentage}%] ${bar} ${message}${colors.reset}`, 'magenta');
}

function showResults(results) {
  const { passed, failed, total, results: testResults } = results;
  const successRate = ((passed / total) * 100).toFixed(1);
  
  showProgress(passed, total, 'Endpoints actifs');
  
  log(`\n${colors.bold}📊 ÉTAT ACTUEL:${colors.reset}`, 'bold');
  log(`   ✅ Actifs: ${passed}/${total}`, 'green');
  log(`   ❌ Inactifs: ${failed}/${total}`, 'red');
  log(`   🎯 Taux: ${successRate}%`, 
    successRate >= 100 ? 'green' : 
    successRate >= 80 ? 'yellow' : 'red');
  
  log(`\n${colors.bold}🔍 DÉTAIL PAR MODULE:${colors.reset}`, 'bold');
  
  testResults.forEach(test => {
    const statusColor = test.status === '✅' ? 'green' : 'red';
    log(`   ${test.status} ${test.name}`, statusColor);
    if (test.error) {
      log(`      ${colors.dim}${test.error}${colors.reset}`, 'dim');
    }
  });
  
  return successRate;
}

async function monitorDeployment() {
  console.log(`${colors.bold}${colors.magenta}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🔄 BMS IA/ML - MONITORING DÉPLOIEMENT 100%                   ║
║   Surveillance automatique du déploiement Railway             ║
║   Validation en temps réel des endpoints IA/ML                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  logInfo(`URL monitoring: ${API_URL}`);
  logInfo(`Objectif: 100% des endpoints actifs`);
  logInfo(`Démarrage: ${new Date().toISOString()}\n`);
  
  let attempts = 0;
  const maxAttempts = 30; // Maximum 30 tentatives (5 minutes)
  const interval = 10000; // 10 secondes entre chaque vérification
  
  const spinner = showSpinner();
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      const results = await testCriticalEndpoints();
      const successRate = showResults(results);
      
      if (successRate >= 100) {
        clearInterval(spinner);
        
        logHeader('🎉 SUCCÈS ! 100% ATTEINT');
        
        log(`${colors.bold}${colors.green}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🏆 BMS IA/ML - DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !            ║
║   100% des endpoints IA/ML sont maintenant actifs             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`, 'green');
        
        logSuccess(`✅ Validation 100% réussie après ${attempts} tentatives`);
        logSuccess(`✅ Tous les modules IA/ML sont Production-Ready`);
        logSuccess(`✅ BMS est complètement opérationnel`);
        
        log(`\n${colors.bold}🚀 ACTIONS DISPONIBLES:${colors.reset}`, 'bold');
        log(`   🧪 Lancer test complet: npm run test:100`, 'blue');
        log(`   🤖 Tester OCR: npm run test:ocr`, 'blue');
        log(`   💬 Tester Chat IA: curl -X POST ${API_URL}/api/v1/ai/chat -d '{"message":"test"}'`, 'blue');
        log(`   📊 Tester ML: curl "${API_URL}/api/v1/ml-forecast/dashboard?companyId=test"`, 'blue');
        
        log(`\n${colors.bold}📋 PROCHAINES ÉTAPES:${colors.reset}`, 'bold');
        log(`   1. Valider avec tests complets`, 'cyan');
        log(`   2. Tester extraction OCR avec vrais documents`, 'cyan');
        log(`   3. Utiliser les prévisions ML en production`, 'cyan');
        log(`   4. Monitorer les stats temps réel`, 'cyan');
        
        return true;
      }
      
      if (successRate >= 80) {
        logInfo(`\n🔄 Bon progrès: ${successRate}% - Continuons le monitoring...`);
      } else {
        logWarning(`\n⏳ Déploiement en cours: ${successRate}% - Patience...`);
      }
      
    } catch (error) {
      logError(`Erreur monitoring: ${error.message}`);
    }
    
    // Attendre avant la prochaine vérification
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  clearInterval(spinner);
  
  logHeader('⏰ TIMEOUT - DÉPLOIEMENT LONG');
  
  logWarning(`Le déploiement prend plus de temps que prévu (${attempts} tentatives)`);
  logWarning(`Vérifiez manuellement: npm run test:100`);
  logInfo(`Ou consultez les logs Railway pour plus d'informations`);
  
  return false;
}

// Gestion arrêt propre
process.on('SIGINT', () => {
  log(`\n${colors.yellow}⏹️  Monitoring arrêté par l'utilisateur${colors.reset}`, 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log(`\n${colors.yellow}⏹️  Monitoring terminé${colors.reset}`, 'yellow');
  process.exit(0);
});

// Démarrer monitoring
monitorDeployment().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  logError(`Erreur critique monitoring: ${error.message}`);
  process.exit(1);
});
