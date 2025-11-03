#!/usr/bin/env node
/**
 * Script de test pour MobileMoneyService (KkiaPay)
 * Usage: node test-mobile-money.js
 */

require('dotenv').config();
const MobileMoneyService = require('./services/MobileMoneyService');

async function testStatus() {
  console.log('\n📱 === TEST STATUS MOBILE MONEY ===\n');
  
  try {
    const status = MobileMoneyService.getStatus();
    console.log('Status du service:');
    console.log(JSON.stringify(status, null, 2));
    
    if (!status.enabled) {
      console.log('\n⚠️ Service non activé. Vérifiez les clés dans .env');
      return false;
    }
    
    console.log('\n✅ Service activé');
    console.log(`Mode: ${status.sandbox ? 'Sandbox (Test)' : 'Production'}`);
    console.log(`Providers supportés: ${status.supportedProviders.join(', ')}`);
    console.log(`Pays: ${status.countries.join(', ')}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

async function testInitiatePayment() {
  console.log('\n💰 === TEST INITIATION PAIEMENT ===\n');
  
  try {
    const result = await MobileMoneyService.initiatePayment({
      amount: 1000, // 1000 FCFA (montant test)
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      phone: '+22997123456',
      reason: 'Test paiement BMS',
      invoiceId: 'TEST-001'
    });
    
    console.log('✅ Paiement initié avec succès:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n💡 URL de paiement générée:');
    console.log(result.paymentUrl);
    console.log('\nCopiez cette URL dans un navigateur pour tester le paiement');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function testVerifyTransaction() {
  console.log('\n🔍 === TEST VÉRIFICATION TRANSACTION ===\n');
  
  const transactionId = process.argv[2];
  
  if (!transactionId) {
    console.log('⚠️ Aucun ID de transaction fourni');
    console.log('Usage: node test-mobile-money.js <transactionId>');
    console.log('Exemple: node test-mobile-money.js abc123xyz');
    return;
  }
  
  try {
    const result = await MobileMoneyService.verifyTransaction(transactionId);
    
    console.log('✅ Transaction vérifiée:');
    console.log(JSON.stringify(result, null, 2));
    
    const statusEmoji = {
      'SUCCESS': '✅',
      'FAILED': '❌',
      'PENDING': '⏳'
    };
    
    console.log(`\nStatut: ${statusEmoji[result.status] || '❓'} ${result.status}`);
    console.log(`Montant: ${result.amount} ${result.currency}`);
    console.log(`Provider: ${result.provider?.toUpperCase()}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function main() {
  console.log('🚀 Test du service Mobile Money (KkiaPay)\n');
  console.log('Variables d\'environnement:');
  console.log(`  MOBILE_MONEY_PROVIDER: ${process.env.MOBILE_MONEY_PROVIDER || 'non défini'}`);
  console.log(`  MOBILE_MONEY_SANDBOX: ${process.env.MOBILE_MONEY_SANDBOX || 'non défini'}`);
  console.log(`  Public Key: ${process.env.MOBILE_MONEY_PUBLIC_KEY ? '✅ Configurée' : '❌ Manquante'}`);
  console.log(`  Private Key: ${process.env.MOBILE_MONEY_PRIVATE_KEY ? '✅ Configurée' : '❌ Manquante'}`);
  console.log(`  Secret Key: ${process.env.MOBILE_MONEY_SECRET_KEY ? '✅ Configurée' : '❌ Manquante'}`);
  
  // Test 1: Vérifier le status
  const isEnabled = await testStatus();
  
  if (!isEnabled) {
    console.log('\n❌ Impossible de continuer les tests');
    return;
  }
  
  // Test 2: Si un transactionId est fourni, le vérifier
  if (process.argv[2]) {
    await testVerifyTransaction();
  } else {
    // Sinon, tester l'initiation d'un paiement
    await testInitiatePayment();
  }
  
  console.log('\n✅ Tests terminés!\n');
  console.log('💡 Notes:');
  console.log('  - Mode Sandbox: Utilisez les numéros de test KkiaPay');
  console.log('  - Mode Production: Paiements réels avec argent réel');
  console.log('  - Numéros test Sandbox: https://docs.kkiapay.me/v1/guides/tests');
  console.log('  - Providers: MTN, Moov, Wave, Orange Money');
  console.log('  - Webhook URL: https://votre-api.com/api/v1/mobile-money/webhook\n');
}

main().catch(console.error);
