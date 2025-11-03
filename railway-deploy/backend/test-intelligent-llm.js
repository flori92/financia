#!/usr/bin/env node

/**
 * Test du Service LLM Intelligent BMS
 * Valide OpenAI GPT-4 avec contexte BMS
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8080';
const TEST_COMPANY_ID = 'demo-company-1';
const TEST_USER_ID = 'demo-user-1';

// Tests à exécuter
const TESTS = [
  {
    name: 'Chat IA Basique',
    endpoint: '/api/v1/ai/chat',
    method: 'POST',
    data: {
      question: 'Bonjour, présente-toi et dis-moi ce que tu peux faire pour mon entreprise.',
      companyId: TEST_COMPANY_ID,
      userId: TEST_USER_ID
    }
  },
  {
    name: 'Analyse Financière',
    endpoint: '/api/v1/ai/chat',
    method: 'POST',
    data: {
      question: 'Analyse la santé financière de mon entreprise ce mois-ci et donne 3 recommandations.',
      companyId: TEST_COMPANY_ID,
      userId: TEST_USER_ID
    }
  },
  {
    name: 'Génération Rapport',
    endpoint: '/api/v1/ai/reports',
    method: 'POST',
    data: {
      type: 'financial_summary',
      companyId: TEST_COMPANY_ID,
      userId: TEST_USER_ID
    }
  },
  {
    name: 'Suggestions IA',
    endpoint: '/api/v1/ai/suggestions',
    method: 'GET',
    params: {
      companyId: TEST_COMPANY_ID,
      userId: TEST_USER_ID
    }
  },
  {
    name: 'Statistiques IA',
    endpoint: '/api/v1/ai/stats',
    method: 'GET',
    params: {
      companyId: TEST_COMPANY_ID,
      userId: TEST_USER_ID
    }
  }
];

class IntelligentLLMTester {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  async runTest(test) {
    console.log(`\n🧪 Test: ${test.name}`);
    console.log(`   ${test.method} ${test.endpoint}`);
    
    try {
      const config = {
        method: test.method,
        url: `${BASE_URL}${test.endpoint}`,
        timeout: 30000 // 30 secondes timeout pour les appels IA
      };

      if (test.data) {
        config.data = test.data;
        config.headers = { 'Content-Type': 'application/json' };
      }
      
      if (test.params) {
        config.params = test.params;
      }

      const startTime = Date.now();
      const response = await axios(config);
      const duration = Date.now() - startTime;

      const result = {
        name: test.name,
        status: '✅ SUCCÈS',
        duration: `${duration}ms`,
        response: response.data,
        details: this.extractDetails(response.data, test)
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
        details: 'Erreur lors du test'
      };

      console.log(`   ${result.status}`);
      console.log(`   Erreur: ${result.error}`);
      
      this.results.push(result);
      this.failed++;

      return result;
    }
  }

  extractDetails(data, test) {
    try {
      switch (test.name) {
        case 'Chat IA Basique':
        case 'Analyse Financière':
          if (data.success && data.data?.response) {
            const response = data.data.response;
            const hasContext = data.data.context?.hasData;
            const tokensUsed = data.data.metadata?.tokensUsed || 0;
            const cost = data.data.metadata?.cost || 0;
            
            return `📊 Contexte: ${hasContext ? 'Oui' : 'Non'} | 🪙 Tokens: ${tokensUsed} | 💰 Coût: $${cost.toFixed(4)} | 📝 Réponse: ${response.length} caractères`;
          }
          return 'Réponse invalide';
          
        case 'Génération Rapport':
          if (data.success && data.data?.report) {
            const report = data.data.report;
            return `📄 Rapport généré: ${report.length} caractères | 🏷️ Type: ${data.data.type}`;
          }
          return 'Rapport non généré';
          
        case 'Suggestions IA':
          if (data.success && data.data?.suggestions) {
            const count = data.data.suggestions.length;
            return `💡 ${count} suggestions personnalisées`;
          }
          return 'Aucune suggestion';
          
        case 'Statistiques IA':
          if (data.success && data.data?.stats) {
            const stats = data.data.stats;
            return `📈 ${stats.total_interactions} interactions | 💵 Coût total: $${stats.totalCost?.toFixed(4) || '0'}`;
          }
          return 'Statistiques indisponibles';
          
        default:
          return 'Test complété';
      }
    } catch (error) {
      return 'Erreur extraction détails';
    }
  }

  async runAllTests() {
    console.log('🚀 DÉMARRAGE TESTS IA INTELLIGENTE BMS');
    console.log('=' .repeat(60));
    console.log(`URL de base: ${BASE_URL}`);
    console.log(`Entreprise test: ${TEST_COMPANY_ID}`);
    console.log(`Utilisateur test: ${TEST_USER_ID}`);
    console.log('=' .repeat(60));

    // Exécuter tous les tests
    for (const test of TESTS) {
      await this.runTest(test);
      // Petite pause entre les tests pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Afficher le résumé
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DES TESTS IA INTELLIGENTE');
    console.log('=' .repeat(60));
    
    console.log(`✅ Tests réussis: ${this.passed}`);
    console.log(`❌ Tests échoués: ${this.failed}`);
    console.log(`📈 Taux de réussite: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
    
    console.log('\n📋 DÉTAILS DES TESTS:');
    this.results.forEach(result => {
      console.log(`   ${result.status} ${result.name} (${result.duration})`);
      if (result.error) {
        console.log(`      Erreur: ${result.error}`);
      } else {
        console.log(`      ${result.details}`);
      }
    });

    // Recommandations
    console.log('\n💡 RECOMMANDATIONS:');
    if (this.failed === 0) {
      console.log('   🎉 Tous les tests IA sont réussis !');
      console.log('   ✨ Le service LLM intelligent est opérationnel');
      console.log('   📊 Vérifiez les coûts dutilisation dans les stats');
    } else {
      console.log('   🔧 Corrigez les erreurs avant de mettre en production');
      console.log('   📝 Vérifiez la configuration OPENAI_API_KEY');
      console.log('   🗄️ Assurez-vous que la base de données est accessible');
    }

    console.log('\n🔗 PROCHAINES ÉTAPES:');
    console.log('   1. Configurez OPENAI_API_KEY dans .env');
    console.log('   2. Testez avec des données réelles');
    console.log('   3. Surveillez les coûts dutilisation');
    console.log('   4. Déployez en production');
  }
}

// Exécuter les tests si ce script est lancé directement
if (require.main === module) {
  const tester = new IntelligentLLMTester();
  tester.runAllTests().catch(console.error);
}

module.exports = IntelligentLLMTester;
