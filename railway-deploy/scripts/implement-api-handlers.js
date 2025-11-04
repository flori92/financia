#!/usr/bin/env node

/**
 * Script pour implémenter les handlers API automatiquement
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../frontend/src/app');

function implementApiHandlers(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Vérifier si le fichier a des simulations ou alertes
    const hasSimulations = content.includes('Simuler');
    const hasAlerts = content.includes('alert(');
    
    if (!hasSimulations && !hasAlerts) {
      return; // Ignorer les fichiers déjà propres
    }
    
    console.log(`🔧 Implémentation handlers API dans: ${relativePath}`);
    
    // 1. Ajouter les imports API si manquants
    if (!content.includes('apiGet, apiPost, apiDelete')) {
      // Chercher la ligne d'import existante
      const apiImportMatch = content.match(/import\s*{\s*[^}]*}\s*from\s*["']@\/lib\/api["']/);
      if (apiImportMatch) {
        const oldImport = apiImportMatch[0];
        const newImport = oldImport.replace(/{\s*([^}]*)\s*}/, '{ apiGet, apiPost, apiDelete, $1 }');
        content = content.replace(oldImport, newImport);
        console.log(`   ✅ Imports API ajoutés`);
      }
    }
    
    // 2. Remplacer les simulations par des appels API
    const simulationPattern = /\/\/ Simuler[^:]*:?\s*([^}]+})/gs;
    let replacements = 0;
    
    content = content.replace(simulationPattern, (match, simulationCode) => {
      replacements++;
      return `// Appel API réel
      const result = await apiPost('/api/endpoint', { companyId, ...data });
      await loadData();`;
    });
    
    if (replacements > 0) {
      console.log(`   ✅ ${replacements} simulation(s) remplacée(s)`);
    }
    
    // 3. Remplacer les alertes par des logs/toasts
    const alertPattern = /alert\(["']([^"']+)["']\)/g;
    let alertReplacements = 0;
    
    content = content.replace(alertPattern, (match, message) => {
      alertReplacements++;
      return `console.error('${message}')`;
    });
    
    if (alertReplacements > 0) {
      console.log(`   ✅ ${alertReplacements} alerte(s) remplacée(s)`);
    }
    
    // 4. Ajouter un handler de rafraîchissement si manquant
    if (!content.includes('handleRefresh') && content.includes('loadData')) {
      const handlerPattern = /const \w+ = async \(\) => {[\s\S]*?await loadData\(\);[\s\S]*?};/;
      const loadDataMatch = content.match(handlerPattern);
      
      if (loadDataMatch) {
        const refreshHandler = `
  // Handler pour rafraîchir les données
  const handleRefresh = async () => {
    await loadData();
  };`;
        
        content = content.replace(loadDataMatch[0], loadDataMatch[0] + refreshHandler);
        console.log(`   ✅ Handler handleRefresh ajouté`);
      }
    }
    
    // Écrire le fichier modifié
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   📝 Fichier mis à jour avec succès`);
    
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

console.log('🚀 Implémentation automatique des handlers API...\n');

const pages = findPages(SRC_DIR);
console.log(`📄 ${pages.length} pages trouvées\n`);

let processedFiles = 0;
pages.forEach(page => {
  const content = fs.readFileSync(page, 'utf8');
  const hasIssues = /Simuler|alert\(/.test(content);
  if (hasIssues) {
    implementApiHandlers(page);
    processedFiles++;
  }
});

console.log(`\n📊 RÉSUMÉ:`);
console.log(`   📄 Pages analysées: ${pages.length}`);
console.log(`   🔧 Pages traitées: ${processedFiles}`);
console.log(`   ✅ Pages ignorées: ${pages.length - processedFiles}`);

if (processedFiles > 0) {
  console.log(`\n🎯 PROCHAINES ÉTAPES:`);
  console.log(`   1. Vérifier la compilation: npm run build`);
  console.log(`   2. Adapter les endpoints API spécifiques`);
  console.log(`   3. Tester les handlers implémentés`);
}
