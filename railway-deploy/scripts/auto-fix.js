#!/usr/bin/env node

/**
 * Script de corrections automatiques BMS
 * Corrige les problèmes critiques identifiés dans l'audit
 */

const fs = require('fs');
const path = require('path');

// Compteurs
let stats = {
  filesScanned: 0,
  filesModified: 0,
  companyIdFixed: 0,
  alertsFixed: 0,
  idsFixed: 0,
  importsAdded: 0
};

/**
 * Fonction pour corriger un fichier
 */
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let modified = false;

  // 1. Remplacer companyId hardcodé avec localStorage
  const companyIdLocalStoragePattern = /const companyId = localStorage\.getItem\(['"]bms_company_id['"]\) \|\| ['"]([^'"]+)['"];?/g;
  if (companyIdLocalStoragePattern.test(content)) {
    content = content.replace(companyIdLocalStoragePattern, "const companyId = useCompanyId();");
    stats.companyIdFixed++;
    modified = true;
  }

  // 2. Remplacer companyId hardcodé simple (UUID ou autres)
  const companyIdHardcodedPatterns = [
    /const companyId = ['"]demo-company-123['"];?/g,
    /const companyId = ['"]company-1['"];?/g,
    /const companyId = ['"]default-company['"];?/g,
    /const companyId = ['"][a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}['"];?\s*\/\/ TODO:/g // UUID avec TODO
  ];
  
  companyIdHardcodedPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, "const companyId = useCompanyId();");
      stats.companyIdFixed++;
      modified = true;
    }
  });

  // 3. Ajouter import useCompanyId si nécessaire
  if (modified && content.includes('useCompanyId()') && !content.includes('from \'@/hooks/useCompanyId\'') && !content.includes('from "@/hooks/useCompanyId"')) {
    // Trouver la position après les imports existants
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
    if (importLines.length > 0) {
      const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]);
      const lastImportEnd = content.indexOf('\n', lastImportIndex);
      
      const importStatement = "import { useCompanyId } from '@/hooks/useCompanyId';\n";
      content = content.slice(0, lastImportEnd + 1) + importStatement + content.slice(lastImportEnd + 1);
      stats.importsAdded++;
    }
  }

  // 4. Remplacer alert() par console avec TODO
  const alertPattern = /alert\(['"]['"]([^'"'"]+)['"]['""]\);?/g;
  if (alertPattern.test(content)) {
    content = content.replace(alertPattern, (match, message) => {
      return `// TODO: Implémenter toast\n      console.log('${message}');`;
    });
    stats.alertsFixed++;
    modified = true;
  }

  // 5. Remplacer IDs hardcodés simples (uniquement '1', '2', etc.)
  const simpleIdPattern = /\bid:\s*['"]['"](\d)['"]['"],/g;
  if (simpleIdPattern.test(content)) {
    content = content.replace(simpleIdPattern, "id: crypto.randomUUID(),");
    stats.idsFixed++;
    modified = true;
  }

  // Sauvegarder si modifié
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    stats.filesModified++;
    return true;
  }

  return false;
}

/**
 * Scanner un répertoire récursivement
 */
function scanDirectory(dir, excludeDirs = ['node_modules', '.next', 'dist', 'build', '.git']) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Répertoire non trouvé: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      if (!excludeDirs.includes(file.name) && !file.name.startsWith('.')) {
        scanDirectory(fullPath, excludeDirs);
      }
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      stats.filesScanned++;
      
      if (fixFile(fullPath)) {
        console.log(`✅ Corrigé: ${fullPath.replace(process.cwd(), '.')}`);
      }
    }
  }
}

/**
 * Fichiers prioritaires à corriger
 */
const priorityFiles = [
  'frontend/src/app/accountant/chart-of-accounts/page.tsx',
  'frontend/src/app/accountant/general-ledger/page.tsx',
  'frontend/src/app/accountant/transactions/page.tsx',
  'frontend/src/app/budget/page.tsx',
  'frontend/src/app/settings/users/page.tsx',
  'frontend/src/app/accountant/cash-flow-coherence/page.tsx',
  'frontend/src/hooks/useAuth.ts'
];

// Afficher le header
console.log('🔧 SCRIPT DE CORRECTIONS AUTOMATIQUES BMS\n');
console.log('📋 Corrections appliquées:');
console.log('   - CompanyId hardcodés → useCompanyId()');
console.log('   - alert() → console.log() avec TODO');
console.log('   - IDs hardcodés → crypto.randomUUID()');
console.log('   - Ajout imports manquants\n');

// Corriger les fichiers prioritaires d'abord
console.log('🎯 Correction des fichiers prioritaires...\n');
priorityFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    stats.filesScanned++;
    if (fixFile(fullPath)) {
      console.log(`✅ Corrigé: ./${file}`);
    }
  }
});

// Scanner tout le répertoire frontend
console.log('\n🔍 Scan complet du frontend...\n');
const frontendPath = path.join(process.cwd(), 'frontend', 'src');
scanDirectory(frontendPath);

// Afficher les statistiques
console.log('\n📊 STATISTIQUES DES CORRECTIONS:');
console.log('─'.repeat(50));
console.log(`📁 Fichiers scannés:        ${stats.filesScanned}`);
console.log(`✏️  Fichiers modifiés:       ${stats.filesModified}`);
console.log(`🔐 CompanyId corrigés:      ${stats.companyIdFixed}`);
console.log(`🚨 Alerts remplacés:        ${stats.alertsFixed}`);
console.log(`🆔 IDs dynamiques:          ${stats.idsFixed}`);
console.log(`📦 Imports ajoutés:         ${stats.importsAdded}`);
console.log('─'.repeat(50));

if (stats.filesModified > 0) {
  console.log('\n✨ Corrections terminées avec succès!');
  console.log('\n📝 Prochaines étapes:');
  console.log('   1. Vérifier les changements: git diff');
  console.log('   2. Tester la compilation: cd frontend && npm run build');
  console.log('   3. Réviser manuellement les TODO ajoutés');
  console.log('   4. Commit: git commit -m "🤖 Corrections automatiques"');
} else {
  console.log('\n✅ Aucune correction nécessaire - Code déjà propre!');
}

console.log('');
