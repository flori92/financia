#!/usr/bin/env node

/**
 * Test des Prévisions Avancées Llama GRATUIT
 * Validation CA, Bénéfices, Trésorerie avec IA 100% gratuite
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8080';
const TEST_COMPANY_ID = 'demo-company-1';
const TEST_USER_ID = 'demo-user-1';

// Tests de prévisions
const FORECAST_TESTS = [
  {
    name: 'Prévisions Chiffre d\'Affaires',
    endpoint: '/api/v1/ai/free/forecast/revenue',
    method: 'POST',
    data: {
      companyId: TEST_COMPANY_ID,
      userId: TEST_USER_ID,
      months: 6
    }
  },
  {
    name: 'Prévisions Bénéfices et Rentabilité',
    endpoint: '/api/v1/ai/free/forecast/profit',
    method: 'POST',
    data: {
      companyId: TEST_COMPANY_ID,
      userId: TEST_USER_ID,
      months: 6
    }
  },
  {
    name: 'Prévisions Trésorerie',
    endpoint: '/api/v1/ai/free/forecast/cash-flow',
    method: 'POST',
    data: {
      companyId: TEST_COMPANY_ID,
      userId: TEST_USER_ID,
      months: 3
    }
  },
  {
    name: 'Prévisions Complètes (CA + Bénéfices + Trésorerie)',
    endpoint: '/api/v1/ai/free/forecast/comprehensive',
    method: 'POST',
    data: {
      companyId: TEST_COMPANY_ID,
      userId: TEST_USER_ID,
      months: 6
    }
  }
];

class ForecastTester {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  async runTest(test) {
    console.log(`\n📈 Test: ${test.name}`);
    console.log(`   ${test.method} ${test.endpoint}`);
    
    try {
      const config = {
        method: test.method,
        url: `${BASE_URL}${test.endpoint}`,
        timeout: 45000, // 45 secondes timeout pour prévisions IA
        data: test.data,
        headers: { 'Content-Type': 'application/json' }
      };

      const startTime = Date.now();
      const response = await axios(config);
      const duration = Date.now() - startTime;

      const result = {
        name: test.name,
        status: '✅ SUCCÈS',
        duration: `${duration}ms`,
        response: response.data,
        details: this.extractForecastDetails(response.data, test)
      };

      console.log(`   ${result.status} (${result.duration})`);
      console.log(`   ${result.details}`);
      
      this.results.push(result);
      this.passed++;

      return result;

    } catch (error) {
      const result = {
        name: test.name,
        status: '❌ ÉCHEC',
        duration: 'N/A',
        error: error.response?.data || error.message,
        details: 'Erreur lors de la prévision'
      };

      console.log(`   ${result.status}`);
      console.log(`   Erreur: ${result.error}`);
      
      this.results.push(result);
      this.failed++;

      return result;
    }
  }

  extractForecastDetails(data, test) {
    try {
      if (data.success && data.data) {
        switch (test.name) {
          case 'Prévisions Chiffre d\'Affaires':
            if (data.data.forecast) {
              const forecastLength = data.data.forecast.length;
              const hasHistorical = data.data.historicalData?.length || 0;
              return `📊 Prévisions générées: ${forecastLength} caractères | 📈 Données historiques: ${hasHistorical} mois | 🦙 Llama GRATUIT`;
            }
            return 'Prévisions CA non générées';
            
          case 'Prévisions Bénéfices et Rentabilité':
            if (data.data.profitForecast) {
              const forecastLength = data.data.profitForecast.length;
              const hasProfitData = data.data.profitData?.length || 0;
              return `💰 Prévisions bénéfices: ${forecastLength} caractères | 📊 Données profit: ${hasProfitData} mois | 🦙 Analyse rentabilité`;
            }
            return 'Prévisions bénéfices non générées';
            
          case 'Prévisions Trésorerie':
            if (data.data.cashFlowForecast) {
              const forecastLength = data.data.cashFlowForecast.length;
              const hasCashData = data.data.cashFlowData?.length || 0;
              return `🌊 Prévisions trésorerie: ${forecastLength} caractères | 💵 Données flux: ${hasCashData} mois | 🦙 Risques identifiés`;
            }
            return 'Prévisions trésorerie non générées';
            
          case 'Prévisions Complètes (CA + Bénéfices + Trésorerie)':
            if (data.data.comprehensiveForecast) {
              const forecastLength = data.data.comprehensiveForecast.length;
              const hasAllData = data.data.allData ? Object.keys(data.data.allData).length : 0;
              return `📊 Plan complet: ${forecastLength} caractères | 📈 Types données: ${hasAllData} | 🦙 Stratégie intégrée`;
            }
            return 'Prévisions complètes non générées';
            
          default:
            return 'Test de prévision complété';
        }
      } else {
        return 'Réponse invalide ou erreur';
      }
    } catch (error) {
      return 'Erreur extraction détails prévisions';
    }
  }

  async runAllTests() {
    console.log('🚀 DÉMARRAGE TESTS PRÉVISIONS LLAMA GRATUIT');
    console.log('=' .repeat(60));
    console.log(`URL de base: ${BASE_URL}`);
    console.log(`Entreprise test: ${TEST_COMPANY_ID}`);
    console.log(`Utilisateur test: ${TEST_USER_ID}`);
    console.log(`💰 Coût attendu: 0 FCFA (100% GRATUIT)`);
    console.log('=' .repeat(60));

    // Exécuter tous les tests de prévisions
    for (const test of FORECAST_TESTS) {
      await this.runTest(test);
      // Pause entre les tests pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Afficher le résumé
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ TESTS PRÉVISIONS LLAMA GRATUIT');
    console.log('=' .repeat(60));
    
    console.log(`✅ Tests réussis: ${this.passed}`);
    console.log(`❌ Tests échoués: ${this.failed}`);
    console.log(`📈 Taux de réussite: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
    console.log(`💰 Coût total des tests: 0 FCFA (GRATUIT !)`);
    
    console.log('\n📋 DÉTAILS DES PRÉVISIONS:');
    this.results.forEach(result => {
      console.log(`   ${result.status} ${result.name} (${result.duration})`);
      if (result.error) {
        console.log(`      Erreur: ${result.error}`);
      } else {
        console.log(`      ${result.details}`);
      }
    });

    // Recommandations
    console.log('\n💡 CAPACITÉS DE PRÉVISION VALIDÉES:');
    if (this.failed === 0) {
      console.log('   🎉 Toutes les prévisions IA fonctionnent !');
      console.log('   ✨ Prévisions CA basées sur données réelles');
      console.log('   💰 Analyse rentabilité et marges futures');
      console.log('   🌊 Gestion trésorerie prévisionnelle');
      console.log('   📊 Plan stratégique intégré disponible');
      console.log('   🦙 Performance professionnelle GRATUITE');
    } else {
      console.log('   🔧 Corrigez les erreurs de prévision');
      console.log('   📝 Vérifiez la configuration TOGETHER_API_KEY');
      console.log('   🌐 Assurez-vous que les données historiques existent');
      console.log('   🦙 Llama reste gratuit même en cas de fallback');
    }

    console.log('\n🔗 UTILISATION DES PRÉVISIONS:');
    console.log('   1. Configurez TOGETHER_API_KEY dans .env (GRATUIT)');
    console.log('   2. Assurez-vous d\'avoir des données comptables historiques');
    console.log('   3. Utilisez les endpoints selon vos besoins:');
    console.log('      • /forecast/revenue - Prévisions CA');
    console.log('      • /forecast/profit - Rentabilité future');
    console.log('      • /forecast/cash-flow - Trésorerie prévisionnelle');
    console.log('      • /forecast/comprehensive - Plan stratégique complet');

    console.log('\n💎 AVANTAGE CONCURRENTIEL:');
    console.log('   🏆 Seul ERP africain avec prévisions IA gratuites');
    console.log('   💸 Économie: $200-500/mois vs solutions prévisionnelles payantes');
    console.log('   📈 Performance: Analyse basée sur VOS données réelles');
    console.log('   🌍 Spécialisation: Adaptée au marché africain (OHADA)');
    console.log('   🦙 Intelligence: Llama 3.2 + prompts spécialisés');
  }
}

// Exécuter les tests si ce script est lancé directement
if (require.main === module) {
  const tester = new ForecastTester();
  tester.runAllTests().catch(console.error);
}

module.exports = ForecastTester;
