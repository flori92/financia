#!/usr/bin/env node

/**
 * Wait for 100% IA/ML - Attente active jusqu'à validation complète
 * Usage: node wait-for-100.js
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'https://bms-production-d9e9.up.railway.app';

console.log('🎯 Attente validation 100% IA/ML... v2.0');
console.log(`📍 URL: ${API_URL}`);
console.log(`⏰ Début: ${new Date().toISOString()}\n`);

const tests = [
  { name: 'Health', url: '/health', icon: '🏥' },
  { name: 'OCR Stats', url: '/api/v1/ai/ocr/stats', icon: '🤖' },
  { name: 'OCR Config', url: '/api/v1/ai/ocr/test', icon: '🔧', method: 'POST', data: {} },
  { name: 'Chat IA', url: '/api/v1/ai/chat', icon: '💬', method: 'POST', data: { message: 'Test 100%' } },
  { name: 'ML Dashboard', url: '/api/v1/ml-forecast/dashboard?companyId=1805bc61-7cfd-44e9-8a63-17187bf05dc7&metric=revenue&horizon=6', icon: '📊' },
  { name: 'ML Predict', url: '/api/v1/ml-forecast/predict?companyId=1805bc61-7cfd-44e9-8a63-17187bf05dc7&model=Ensemble&horizon=6', icon: '🔮' },
  { name: 'ML Performance', url: '/api/v1/ml-forecast/models/performance?companyId=1805bc61-7cfd-44e9-8a63-17187bf05dc7', icon: '📈' }
];

async function checkStatus() {
  let passed = 0;
  let failed = 0;
  const results = [];
  
  for (const test of tests) {
    try {
      let response;
      if (test.method === 'POST') {
        response = await axios.post(`${API_URL}${test.url}`, test.data, { timeout: 3000 });
      } else {
        response = await axios.get(`${API_URL}${test.url}`, { timeout: 3000 });
      }
      
      if (response.status === 200) {
        console.log(`✅ ${test.icon} ${test.name}`);
        passed++;
        results.push({ name: test.name, status: '✅' });
      } else {
        console.log(`❌ ${test.icon} ${test.name} (${response.status})`);
        failed++;
        results.push({ name: test.name, status: '❌' });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`⏳ ${test.icon} ${test.name} (déploiement en cours)`);
      } else if (error.response?.status === 400) {
        console.log(`⚠️  ${test.icon} ${test.name} (configuration)`);
      } else {
        console.log(`❌ ${test.icon} ${test.name} (${error.message})`);
      }
      failed++;
      results.push({ name: test.name, status: '⏳' });
    }
  }
  
  const total = passed + failed;
  const successRate = ((passed / total) * 100).toFixed(1);
  
  // Progress bar
  const bar = '█'.repeat(Math.floor(successRate / 5)) + '░'.repeat(20 - Math.floor(successRate / 5));
  console.log(`\n[${successRate}%] ${bar} ${passed}/${total} endpoints actifs\n`);
  
  return { passed, failed, total, successRate, results };
}

async function waitFor100() {
  let attempts = 0;
  const maxAttempts = 60; // 10 minutes max
  
  while (attempts < maxAttempts) {
    attempts++;
    
    console.log(`\n🔄 Tentative ${attempts}/${maxAttempts}`);
    console.log('─'.repeat(50));
    
    const result = await checkStatus();
    
    if (result.successRate >= 100) {
      console.log('🎉'.repeat(20));
      console.log('🏆 SUCCÈS ! 100% DES MODULES IA/ML FONCTIONNELS !');
      console.log('🎉'.repeat(20));
      
      console.log('\n✅ Validation terminée avec succès !');
      console.log(`✅ Temps total: ${attempts * 10} secondes`);
      console.log(`✅ ${result.passed}/${result.total} endpoints actifs`);
      
      console.log('\n🚀 Actions disponibles:');
      console.log('   • npm run test:100 (validation complète)');
      console.log('   • npm run test:ai (tests IA/ML)');
      console.log('   • npm run test:ocr (tests OCR)');
      
      console.log('\n📊 Utilisation production:');
      console.log('   • Chat IA: POST /api/v1/ai/chat');
      console.log('   • OCR: POST /api/v1/ai/ocr/:type');
      console.log('   • ML Forecast: GET /api/v1/ml-forecast/dashboard');
      
      console.log('\n🎯 BMS est maintenant 100% Production-Ready !');
      
      return true;
    }
    
    if (result.successRate >= 85) {
      console.log('🔥 BON PROGRÈS ! Presque terminé...');
    } else if (result.successRate >= 70) {
      console.log('👍 BON ! On continue...');
    } else {
      console.log('⏳ Déploiement en cours, patience...');
    }
    
    console.log(`⏱️  Prochaine vérification dans 10 secondes...`);
    
    // Attendre 10 secondes
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  
  console.log('\n⏰ TIMEOUT - Déploiement prend plus de temps que prévu');
  console.log('💡 Vérifiez manuellement: node src/ai/quick-check.js');
  console.log('💡 Ou consultez les logs Railway');
  
  return false;
}

// Démarrer monitoring
waitFor100().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Erreur monitoring:', error.message);
  process.exit(1);
});
