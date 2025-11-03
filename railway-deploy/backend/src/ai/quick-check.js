#!/usr/bin/env node

/**
 * Quick Check IA/ML - Vérification rapide état déploiement
 * Usage: node quick-check.js
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'https://bms-production-d9e9.up.railway.app';

const tests = [
  { name: 'Health', url: '/health', icon: '🏥' },
  { name: 'OCR Stats', url: '/api/v1/ai/ocr/stats', icon: '🤖' },
  { name: 'OCR Config', url: '/api/v1/ai/ocr/test', icon: '🔧', method: 'POST', data: {} },
  { name: 'Chat IA', url: '/api/v1/ai/chat', icon: '💬', method: 'POST', data: { message: 'Quick test' } },
  { name: 'ML Dashboard', url: '/api/v1/ml-forecast/dashboard?companyId=test&metric=revenue&horizon=6', icon: '📊' },
  { name: 'ML Predict', url: '/api/v1/ml-forecast/predict?companyId=test&model=Ensemble&horizon=6', icon: '🔮' },
  { name: 'ML Performance', url: '/api/v1/ml-forecast/models/performance?companyId=test', icon: '📈' }
];

async function quickCheck() {
  console.log('🚀 Quick Check IA/ML - État déploiement v3.0');
  
  let passed = 0;
  let failed = 0;
  
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
      } else {
        console.log(`❌ ${test.icon} ${test.name} (${response.status})`);
        failed++;
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`⏳ ${test.icon} ${test.name} (déploiement en cours)`);
      } else {
        console.log(`❌ ${test.icon} ${test.name} (${error.message})`);
      }
      failed++;
    }
  }
  
  const total = passed + failed;
  const successRate = ((passed / total) * 100).toFixed(1);
  
  console.log(`\n📊 Résultat: ${passed}/${total} (${successRate}%)`);
  
  if (successRate >= 100) {
    console.log('🎉 PARFAIT ! 100% atteint !');
  } else if (successRate >= 80) {
    console.log('👍 BON ! Presque terminé...');
  } else {
    console.log('⏳ En cours de déploiement...');
  }
  
  return successRate;
}

quickCheck().then(rate => {
  process.exit(rate >= 100 ? 0 : 1);
});
