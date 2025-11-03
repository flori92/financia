#!/usr/bin/env node

/**
 * Script de test OCR - Vérification configuration
 * Usage: node test-ocr.js
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testConfiguration() {
  console.log('🔍 Test Configuration OCR...\n');
  
  try {
    const response = await axios.post(`${API_URL}/api/v1/ai/ocr/test`);
    
    if (response.data.success) {
      console.log('✅ Configuration OCR valide !');
      console.log('\nProviders configurés:');
      console.log(`  - Google Vision: ${response.data.config.googleVision ? '✅' : '❌'}`);
      console.log(`  - OCR Space: ${response.data.config.ocrSpace ? '✅' : '❌'}`);
      
      if (!response.data.config.googleVision && !response.data.config.ocrSpace) {
        console.log('\n⚠️  ATTENTION: Aucun provider configuré !');
        console.log('   Ajoutez au moins une clé API dans .env');
      }
    } else {
      console.log('❌ Configuration invalide:', response.data.error);
    }
  } catch (error) {
    console.log('❌ Erreur test:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Le serveur ne répond pas.');
      console.log('   Assurez-vous que le backend est démarré:');
      console.log('   npm start');
    }
  }
}

async function testStats() {
  console.log('\n📊 Statistiques OCR...\n');
  
  try {
    const response = await axios.get(`${API_URL}/api/v1/ai/ocr/stats`);
    
    if (response.data.success) {
      const stats = response.data.stats;
      console.log(`Google Vision:`);
      console.log(`  - Succès: ${stats.googleSuccess}`);
      console.log(`  - Échecs: ${stats.googleFailed}`);
      console.log(`  - Taux: ${(stats.googleRate * 100).toFixed(1)}%`);
      
      console.log(`\nOCR Space:`);
      console.log(`  - Succès: ${stats.ocrSpaceSuccess}`);
      console.log(`  - Échecs: ${stats.ocrSpaceFailed}`);
      console.log(`  - Taux: ${(stats.ocrSpaceRate * 100).toFixed(1)}%`);
    }
  } catch (error) {
    console.log('⚠️  Impossible de récupérer les stats');
  }
}

async function showUsageExamples() {
  console.log('\n📚 Exemples d\'utilisation:\n');
  
  console.log('1️⃣  Test avec cURL:');
  console.log('   curl -X POST http://localhost:3001/api/v1/ai/ocr/invoice \\');
  console.log('     -F "file=@facture.jpg"\n');
  
  console.log('2️⃣  Test avec JavaScript:');
  console.log('   const formData = new FormData();');
  console.log('   formData.append(\'file\', fileInput.files[0]);');
  console.log('   ');
  console.log('   const response = await fetch(\'/api/v1/ai/ocr/invoice\', {');
  console.log('     method: \'POST\',');
  console.log('     body: formData');
  console.log('   });\n');
  
  console.log('3️⃣  Types supportés:');
  console.log('   - invoice        (Factures fournisseurs)');
  console.log('   - receipt        (Reçus de caisse)');
  console.log('   - bank_statement (Relevés bancaires)\n');
}

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🤖 Test Module OCR Hybride           ║');
  console.log('║   Google Vision + OCR Space            ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  await testConfiguration();
  await testStats();
  await showUsageExamples();
  
  console.log('✨ Test terminé !\n');
}

main().catch(console.error);
