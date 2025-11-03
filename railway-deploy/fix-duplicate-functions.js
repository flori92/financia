#!/usr/bin/env node

/**
 * Corrige les conflits de noms de fonctions
 * Supprime les fonctions formatCurrency locales et garde seulement l'import
 */

const fs = require('fs');
const path = require('path');

const frontendPath = path.join(__dirname, 'frontend/src');
let fixedFiles = 0;

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Si le fichier a un import format-utils ET une fonction locale formatCurrency
    if (content.includes('import { formatCurrency } from "@/lib/format-utils"') && 
        content.includes('function formatCurrency(')) {
      
      // Supprimer la fonction locale formatCurrency
      const functionRegex = /function formatCurrency\(value: number\) \{[\s\S]*?\n\}/;
      content = content.replace(functionRegex, '');
      
      // Sauvegarder si modifié
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        fixedFiles++;
        console.log(`✅ Corrigé: ${filePath.replace(__dirname, '')} (suppression fonction locale)`);
      }
    }
    
  } catch (e) {
    console.error(`❌ Erreur fichier ${filePath}:`, e.message);
  }
}

function scanDirectory(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== 'node_modules' && item.name !== '.next') {
      scanDirectory(fullPath);
    } else if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.ts'))) {
      fixFile(fullPath);
    }
  }
}

console.log('🔧 Correction des conflits de fonctions formatCurrency...\n');
scanDirectory(frontendPath);

console.log(`\n📊 RÉSULTATS:`);
console.log(`   ✅ Fichiers corrigés: ${fixedFiles}`);

if (fixedFiles > 0) {
  console.log(`\n🎯 Prochaine étape:`);
  console.log(`   npm run build (vérifier que tout compile maintenant)`);
} else {
  console.log(`\n✅ Aucune correction nécessaire !`);
}

console.log(`\n🎉 Terminé !`);
