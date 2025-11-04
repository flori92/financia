#!/usr/bin/env node

/**
 * Script pour protéger automatiquement toutes les pages avec AuthGuard et ErrorBoundary
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.join(__dirname, '../frontend/src/app');

// Templates
const IMPORTS_TEMPLATE = `import { AuthGuard } from '@/components/auth/AuthGuard';
import { ErrorBoundary } from '@/components/auth/ErrorBoundary';`;

const WRAPPER_START = `return (
    <ErrorBoundary>
      <AuthGuard>`;

const WRAPPER_END = `      </AuthGuard>
    </ErrorBoundary>
  );`;

function protectPage(filePath) {
  try {
    console.log(`🔒 Protection de: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si déjà protégée
    if (content.includes('AuthGuard') || content.includes('ErrorBoundary')) {
      console.log(`   ✅ Déjà protégée`);
      return;
    }
    
    // Trouver les imports existants
    const importRegex = /import\s+.*?\s+from\s+['"][^'"]+['"];?\s*/g;
    const imports = content.match(importRegex) || [];
    
    // Ajouter nos imports après les imports existants
    const lastImportIndex = content.lastIndexOf(imports[imports.length - 1] || '');
    const insertPosition = lastImportIndex > -1 
      ? content.indexOf('\n', lastImportIndex) + 1 
      : content.indexOf('\n', content.indexOf('export default')) + 1;
    
    content = content.slice(0, insertPosition) + 
              '\n' + IMPORTS_TEMPLATE + '\n' + 
              content.slice(insertPosition);
    
    // Trouver et envelopper le return principal
    const returnMatch = content.match(/return\s*\(\s*<[^>]+>/);
    if (!returnMatch) {
      console.log(`   ⚠️  Impossible de trouver le return principal`);
      return;
    }
    
    const returnStart = returnMatch.index;
    const returnEnd = findMatchingClosingParen(content, returnStart + content.indexOf('(', returnStart));
    
    if (returnEnd === -1) {
      console.log(`   ⚠️  Impossible de trouver la fin du return`);
      return;
    }
    
    // Extraire le contenu original du return
    const originalContent = content.slice(returnStart, returnEnd);
    
    // Trouver l'élément racine dans le return
    const rootElementMatch = originalContent.match(/<[^>]+>/);
    if (!rootElementMatch) {
      console.log(`   ⚠️  Impossible de trouver l'élément racine`);
      return;
    }
    
    const rootElementStart = returnStart + originalContent.indexOf(rootElementMatch[0]);
    const rootElementEnd = findMatchingClosingTag(content, rootElementStart);
    
    if (rootElementEnd === -1) {
      console.log(`   ⚠️  Impossible de trouver la fin de l'élément racine`);
      return;
    }
    
    // Construire le nouveau contenu
    const beforeRoot = content.slice(0, rootElementStart);
    const rootContent = content.slice(rootElementStart, rootElementEnd);
    const afterRoot = content.slice(rootElementEnd);
    
    // Ajouter indentation au contenu racine
    const indentedRoot = rootContent.split('\n').map(line => 
      line.trim() ? '  ' + line : line
    ).join('\n');
    
    const newContent = beforeRoot + WRAPPER_START + indentedRoot + WRAPPER_END + afterRoot;
    
    // Écrire le fichier modifié
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`   ✅ Protégée avec succès`);
    
  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`);
  }
}

function findMatchingClosingParen(str, start) {
  let count = 1;
  let i = start;
  
  while (i < str.length && count > 0) {
    if (str[i] === '(') count++;
    else if (str[i] === ')') count--;
    i++;
  }
  
  return count === 0 ? i : -1;
}

function findMatchingClosingTag(str, start) {
  const tagMatch = str.slice(start).match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/);
  if (!tagMatch) return -1;
  
  const tagName = tagMatch[1];
  let count = 1;
  let i = start + tagMatch[0].length;
  
  while (i < str.length && count > 0) {
    const openTag = str.slice(i).match(new RegExp(`<${tagName}[^>]*>`));
    const closeTag = str.slice(i).match(new RegExp(`</${tagName}>`));
    
    if (openTag && (!closeTag || openTag.index < closeTag.index)) {
      count++;
      i += openTag.index + openTag[0].length;
    } else if (closeTag) {
      count--;
      i += closeTag.index + closeTag[0].length;
    } else {
      break;
    }
  }
  
  return count === 0 ? i : -1;
}

function findPages(dir) {
  const pages = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item === 'page.tsx') {
        pages.push(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  return pages;
}

// Exécution principale
console.log('🚀 Démarrage de la protection des pages...\n');

const pages = findPages(SRC_DIR);
console.log(`📄 ${pages.length} pages trouvées\n`);

// Pages à protéger (exclure login, public, etc.)
const pagesToProtect = pages.filter(page => 
  !page.includes('/login') && 
  !page.includes('/public') &&
  !page.includes('/auth') &&
  (page.includes('/accountant/') || page.includes('/entrepreneur/') || 
   page.includes('/expert/') || page.includes('/bank-partner/') || 
   page.includes('/tax-admin/') || page.includes('/settings/'))
);

console.log(`🎯 ${pagesToProtect.length} pages à protéger\n`);

pagesToProtect.forEach(protectPage);

console.log('\n✅ Protection des pages terminée !');
