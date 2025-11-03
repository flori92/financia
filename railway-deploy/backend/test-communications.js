#!/usr/bin/env node
/**
 * Script de test pour EmailService et SMSService
 * Usage: node test-communications.js
 */

require('dotenv').config();
const EmailService = require('./services/EmailService');
const SMSService = require('./services/SMSService');

async function testEmail() {
  console.log('\n📧 === TEST EMAIL SERVICE ===\n');
  
  try {
    console.log(`Provider: ${process.env.EMAIL_PROVIDER || 'console'}`);
    
    // Test email simple
    const result = await EmailService.send({
      to: 'test@example.com',
      subject: 'Test BMS - Email Service',
      html: '<h1>Test BMS</h1><p>Votre système d\'email fonctionne correctement !</p>',
      text: 'Test BMS - Votre système d\'email fonctionne correctement !'
    });
    
    console.log('✅ Email envoyé avec succès:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur email:', error.message);
  }
}

async function testSMS() {
  console.log('\n📱 === TEST SMS SERVICE ===\n');
  
  try {
    console.log(`Provider: ${process.env.SMS_PROVIDER || 'console'}`);
    
    // Test SMS simple (numéro sandbox Africa's Talking)
    const result = await SMSService.send({
      to: '+254711XXXYYY', // Remplacer par votre numéro test
      message: 'Test BMS - Votre système SMS fonctionne correctement !'
    });
    
    console.log('✅ SMS envoyé avec succès:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur SMS:', error.message);
  }
}

async function testInvoiceEmail() {
  console.log('\n📧 === TEST EMAIL FACTURE ===\n');
  
  try {
    const result = await EmailService.sendInvoice({
      to: 'client@example.com',
      invoiceNumber: 'F-2025-TEST',
      amount: 150000,
      pdfUrl: 'https://example.com/invoice.pdf',
      customerName: 'Client Test'
    });
    
    console.log('✅ Email facture envoyé:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function testInvoiceSMS() {
  console.log('\n📱 === TEST SMS FACTURE ===\n');
  
  try {
    const result = await SMSService.sendInvoiceNotification({
      to: '+229XXXXXXXX', // Remplacer par votre numéro
      invoiceNumber: 'F-2025-TEST',
      amount: 150000,
      customerName: 'Client Test'
    });
    
    console.log('✅ SMS facture envoyé:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

async function main() {
  console.log('🚀 Test des services de communication BMS\n');
  console.log('Variables d\'environnement:');
  console.log(`  EMAIL_PROVIDER: ${process.env.EMAIL_PROVIDER || 'non défini'}`);
  console.log(`  SMS_PROVIDER: ${process.env.SMS_PROVIDER || 'non défini'}`);
  
  // Lancer tous les tests
  await testEmail();
  await testSMS();
  await testInvoiceEmail();
  await testInvoiceSMS();
  
  console.log('\n✅ Tests terminés!\n');
  console.log('💡 Notes:');
  console.log('  - Mode console: Les messages s\'affichent dans les logs uniquement');
  console.log('  - Mode Resend: 3000 emails/mois gratuit');
  console.log('  - Mode Africa\'s Talking sandbox: Numéros test uniquement');
  console.log('  - Mode Africa\'s Talking live: Acheter du crédit SMS\n');
}

main().catch(console.error);
