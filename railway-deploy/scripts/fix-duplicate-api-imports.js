#!/usr/bin/env node

/**
 * Script pour corriger les imports API en double créés par l'automation
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../frontend/src/app');

function fixDuplicateImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Chercher les imports API avec doublons
    const apiImportRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@\/lib\/api['"];?/g;
    const imports = content.match(apiImportRegex);
    
    if (!imports || imports.length === 0) {
      return; // Pas d'import API à corriger
    }
    
    let hasChanges = false;
    
    imports.forEach(importLine => {
      // Extraire les fonctions importées
      const functionsMatch = importLine.match(/{\s*([^}]+)\s*}/);
      if (!functionsMatch) return;
      
      const functions = functionsMatch[1]
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);
      
      // Supprimer les doublons en gardant le premier ordre
      const uniqueFunctions = [];
      const seen = new Set();
      
      functions.forEach(func => {
        if (!seen.has(func)) {
          seen.add(func);
          uniqueFunctions.push(func);
        }
      });
      
      // Si des doublons ont été supprimés
      if (uniqueFunctions.length !== functions.length) {
        const newImport = importLine.replace(/{\s*[^}]+\s*}/, `{ ${uniqueFunctions.join(', ')} }`);
        content = content.replace(importLine, newImport);
        hasChanges = true;
        
        const duplicatesRemoved = functions.length - uniqueFunctions.length;
        console.log(`🔧 ${relativePath}: ${duplicatesRemoved} doublon(s) supprimé(s)`);
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    
  } catch (error) {
    console.error(`❌ Erreur ${filePath}: ${error.message}`);
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

console.log('🔧 Correction des imports API en double...\n');

const pages = findPages(SRC_DIR);
console.log(`📄 ${pages.length} pages trouvées\n`);

let fixedFiles = 0;
pages.forEach(page => {
  const content = fs.readFileSync(page, 'utf8');
  const hasDuplicateImports = /import\s*{[^}]*apiGet[^}]*apiGet[^}]*}.*from\s*['"]@\/lib\/api['"]/.test(content);
  
  if (hasDuplicateImports) {
    fixDuplicateImports(page);
    fixedFiles++;
  }
});

console.log(`\n📊 RÉSUMÉ:`);
console.log(`   📄 Pages analysées: ${pages.length}`);
console.log(`   🔧 Pages corrigées: ${fixedFiles}`);
console.log(`   ✅ Pages propres: ${pages.length - fixedFiles}`);

if (fixedFiles > 0) {
  console.log(`\n🎯 ACTION RECOMMANDÉE:`);
  console.log(`   Vérifier la compilation: npm run build`);
}
