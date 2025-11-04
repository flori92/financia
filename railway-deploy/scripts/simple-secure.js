#!/usr/bin/env node

/**
 * Script simple pour ajouter AuthGuard et ErrorBoundary aux pages
 * Approche minimale et sûre
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../frontend/src/app');

function addProtectionToPage(filePath) {
  try {
    console.log(`🔒 Protection de: ${path.relative(process.cwd(), filePath)}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si déjà protégée
    if (content.includes('AuthGuard') || content.includes('ErrorBoundary')) {
      console.log(`   ✅ Déjà protégée`);
      return;
    }
    
    // Ajouter les imports après le premier import existant
    const importsToAdd = `
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ErrorBoundary } from '@/components/auth/ErrorBoundary';`;
    
    // Trouver la position après les imports
    const firstImportMatch = content.match(/^import.*from.*$/m);
    if (!firstImportMatch) {
      console.log(`   ⚠️  Pas d'import trouvé`);
      return;
    }
    
    const insertAfter = content.indexOf('\n', firstImportMatch.index) + 1;
    content = content.slice(0, insertAfter) + importsToAdd + content.slice(insertAfter);
    
    // Trouver le return principal et l'envelopper simplement
    const returnMatch = content.match(/return\s*\(/);
    if (!returnMatch) {
      console.log(`   ⚠️  Pas de return() trouvé`);
      return;
    }
    
    const returnStart = returnMatch.index;
    
    // Trouver la fin du return (dernière parenthèse fermante au même niveau)
    let parenCount = 0;
    let returnEnd = returnStart;
    
    for (let i = returnStart + content.indexOf('(', returnStart); i < content.length; i++) {
      if (content[i] === '(') parenCount++;
      else if (content[i] === ')') {
        parenCount--;
        if (parenCount === 0) {
          returnEnd = i + 1;
          break;
        }
      }
    }
    
    if (returnEnd <= returnStart) {
      console.log(`   ⚠️  Impossible de trouver la fin du return`);
      return;
    }
    
    // Extraire et envelopper le contenu
    const beforeReturn = content.slice(0, returnStart);
    const returnContent = content.slice(returnStart, returnEnd);
    const afterReturn = content.slice(returnEnd);
    
    // Envelopper avec ErrorBoundary et AuthGuard
    const wrappedContent = `return (
    <ErrorBoundary>
      <AuthGuard>
        ${returnContent.slice(7, -1)}  // Enlever "return (" et ")"
      </AuthGuard>
    </ErrorBoundary>
  );`;
    
    const newContent = beforeReturn + wrappedContent + afterReturn;
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`   ✅ Protégée avec succès`);
    
  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`);
  }
}

function findPages(dir) {
  const pages = [];
  
  function scan(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scan(fullPath);
        } else if (item === 'page.tsx') {
          pages.push(fullPath);
        }
      }
    } catch (err) {
      // Ignorer les erreurs de lecture
    }
  }
  
  scan(dir);
  return pages;
}

// Pages critiques à protéger en priorité
const criticalPages = [
  'frontend/src/app/accountant/page.tsx',
  'frontend/src/app/accountant/journal/page.tsx',
  'frontend/src/app/accountant/chart-of-accounts/page.tsx',
  'frontend/src/app/accountant/trial-balance/page.tsx',
  'frontend/src/app/accountant/profit-loss/page.tsx',
  'frontend/src/app/accountant/balance-sheet/page.tsx',
  'frontend/src/app/accountant/general-ledger/page.tsx',
  'frontend/src/app/accountant/bank/page.tsx',
  'frontend/src/app/entrepreneur/page.tsx',
  'frontend/src/app/entrepreneur/direct-debits/page.tsx',
  'frontend/src/app/settings/page.tsx',
  'frontend/src/app/settings/users/page.tsx'
];

console.log('🚀 Protection des pages critiques...\n');

criticalPages.forEach(pagePath => {
  const fullPath = path.join(__dirname, '..', pagePath);
  if (fs.existsSync(fullPath)) {
    addProtectionToPage(fullPath);
  } else {
    console.log(`⚠️  Page non trouvée: ${pagePath}`);
  }
});

console.log('\n✅ Protection terminée !');
