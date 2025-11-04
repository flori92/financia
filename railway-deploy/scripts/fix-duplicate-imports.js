#!/usr/bin/env node

/**
 * Script pour corriger les imports en double de useCompanyId
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../frontend/src/app');

function fixDuplicateImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier s'il y a des imports en double de useCompanyId
    const useCompanyIdImports = content.match(/import\s*{\s*useCompanyId\s*}\s*from\s*['"]@\/hooks\/useCompanyId['"];?/g) || [];
    
    if (useCompanyIdImports.length > 1) {
      console.log(`🔧 Correction imports en double dans: ${path.relative(process.cwd(), filePath)}`);
      
      // Garder seulement le premier import
      const firstImport = useCompanyIdImports[0];
      const duplicateImports = useCompanyIdImports.slice(1);
      
      let newContent = content;
      duplicateImports.forEach(duplicate => {
        newContent = newContent.replace(duplicate, '');
      });
      
      // Nettoyer les lignes vides multiples
      newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`   ✅ ${duplicateImports.length} import(s) en double supprimé(s)`);
    }
    
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

console.log('🔧 Correction des imports en double...\n');

const pages = findPages(SRC_DIR);
console.log(`📄 ${pages.length} pages trouvées\n`);

pages.forEach(fixDuplicateImports);

console.log('\n✅ Correction terminée !');
