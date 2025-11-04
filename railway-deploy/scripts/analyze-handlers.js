#!/usr/bin/env node

/**
 * Script pour analyser les handlers manquants ou simulés
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../frontend/src/app');

function analyzeHandlers(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Patterns de handlers manquants
    const patterns = [
      { name: 'Simulations', regex: /\/\/ Simuler|Simuler la/g },
      { name: 'TODO/FIXME', regex: /TODO|FIXME/g },
      { name: 'Alerts', regex: /alert\(/g },
      { name: 'Console.log', regex: /console\.log/g },
      { name: 'Placeholders', regex: /placeholder|mock/gi }
    ];
    
    const issues = [];
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern.regex);
      if (matches && matches.length > 0) {
        issues.push({
          type: pattern.name,
          count: matches.length,
          examples: matches.slice(0, 3)
        });
      }
    });
    
    // Chercher les fonctions handlers vides
    const emptyHandlers = content.match(/const\s+\w+Handler\s*=\s*\(\s*\)\s*=>\s*\{\s*\}/g) || [];
    if (emptyHandlers.length > 0) {
      issues.push({
        type: 'Handlers vides',
        count: emptyHandlers.length,
        examples: emptyHandlers.slice(0, 3)
      });
    }
    
    if (issues.length > 0) {
      console.log(`\n📋 ${relativePath}:`);
      issues.forEach(issue => {
        console.log(`   ⚠️  ${issue.type}: ${issue.count} occurrence(s)`);
        if (issue.examples.length > 0) {
          console.log(`      Exemples: ${issue.examples.join(', ')}`);
        }
      });
    }
    
  } catch (error) {
    console.error(`❌ Erreur analyse ${filePath}: ${error.message}`);
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

console.log('🔍 Analyse des handlers manquants...\n');

const pages = findPages(SRC_DIR);
console.log(`📄 Analyse de ${pages.length} pages\n`);

let totalIssues = 0;
pages.forEach(page => {
  const content = fs.readFileSync(page, 'utf8');
  const hasIssues = /Simuler|TODO|FIXME|alert\(|console\.log|placeholder|mock|Handler\s*=\s*\(\s*\)\s*=>\s*\{\s*\}/.test(content);
  if (hasIssues) {
    analyzeHandlers(page);
    totalIssues++;
  }
});

console.log(`\n📊 RÉSUMÉ:`);
console.log(`   📄 Pages analysées: ${pages.length}`);
console.log(`   ⚠️  Pages avec issues: ${totalIssues}`);
console.log(`   ✅ Pages propres: ${pages.length - totalIssues}`);

if (totalIssues > 0) {
  console.log(`\n🎯 ACTIONS RECOMMANDÉES:`);
  console.log(`   1. Prioriser les pages critiques (settings, purchases, etc.)`);
  console.log(`   2. Remplacer les simulations par des appels API réels`);
  console.log(`   3. Implémenter les handlers vides`);
  console.log(`   4. Standardiser les réponses API`);
}
