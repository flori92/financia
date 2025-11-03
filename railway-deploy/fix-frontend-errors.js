#!/usr/bin/env node

/**
 * Correction automatique des erreurs JavaScript frontend
 * Remplace .toLocaleString() par formatCurrency sécurisé
 */

const fs = require('fs');
const path = require('path');

const frontendPath = path.join(__dirname, 'frontend/src');
let fixedFiles = 0;
let totalFixes = 0;

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Ajouter import format-utils si pas déjà présent
    if (!content.includes('format-utils')) {
      // Trouver la ligne d'import
      const importRegex = /(import\s+.*\s+from\s+["']@\/lib\/api["'];?\n)/;
      const match = content.match(importRegex);
      
      if (match) {
        content = content.replace(
          match[0],
          match[0] + "import { formatCurrency } from \"@/lib/format-utils\";\n"
        );
      }
    }
    
    // Remplacer les patterns .toLocaleString() FCFA
    const patterns = [
      // Pattern: value.toLocaleString() FCFA
      /(\w+(?:\.\w+)*)\.toLocaleString\(\)\s+FCFA/g,
      // Pattern: ${value.toLocaleString()} FCFA
      /\$\{([^}]+)\.toLocaleString\(\)\}\s+FCFA/g,
      // Pattern: value.toLocaleString() (sans FCFA)
      /(\w+(?:\.\w+)*)\.toLocaleString\(\)/g
    ];
    
    patterns.forEach((pattern, index) => {
      let replacements = 0;
      content = content.replace(pattern, (match, p1) => {
        replacements++;
        
        if (index === 1) {
          // Template literal pattern
          return `\${formatCurrency(${p1})}`;
        } else if (match.includes('FCFA')) {
          // Direct usage with FCFA
          return `formatCurrency(${p1})`;
        } else {
          // Usage without FCFA - keep toLocaleString but with safety
          return `safeToLocaleString(${p1})`;
        }
      });
      
      totalFixes += replacements;
    });
    
    // Si le contenu a changé, sauvegarder
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      fixedFiles++;
      console.log(`✅ Corrigé: ${filePath.replace(__dirname, '')} (${totalFixes} corrections)`);
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

console.log('🔧 Correction automatique des erreurs JavaScript frontend...\n');
console.log('📍 Recherche des fichiers à corriger...\n');

scanDirectory(frontendPath);

console.log(`\n📊 RÉSULTATS:`);
console.log(`   ✅ Fichiers corrigés: ${fixedFiles}`);
console.log(`   🔧 Corrections totales: ${totalFixes}`);

if (fixedFiles > 0) {
  console.log(`\n🎯 Prochaine étape:`);
  console.log(`   1. npm run build (vérifier que tout compile)`);
  console.log(`   2. npm run dev (tester les corrections)`);
  console.log(`   3. npm run test:100 (vérifier backend toujours OK)`);
} else {
  console.log(`\n✅ Aucune correction nécessaire !`);
}

console.log(`\n📝 Note: Les corrections utilisent formatCurrency() qui gère null/undefined automatiquement.`);
console.log(`\n🎉 Terminé !`);
