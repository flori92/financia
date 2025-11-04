#!/usr/bin/env node

/**
 * Script de validation systématique de tous les handlers BMS
 * Vérifie que chaque page a des handlers fonctionnels connectés à l'API
 */

const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../src/app');

// Fonction pour analyser un fichier et extraire les handlers
function analyzeHandlers(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Patterns pour détecter les handlers
    const patterns = {
      onClick: /onClick\s*=\s*\{[^}]+\}/g,
      handlers: /const\s+(handle\w+)\s*=\s*(?:async)?\s*\([^)]*\)\s*=>/g,
      apiCalls: /api(Get|Post|Put|Delete|Patch)\s*\(/g,
      functionalButtons: /FunctionalButton/g,
      alertCalls: /alert\s*\(/g,
      consoleErrors: /console\.error/g
    };
    
    const results = {
      file: filePath,
      hasOnClick: patterns.onClick.test(content),
      handlers: (content.match(patterns.handlers) || []).length,
      apiCalls: (content.match(patterns.apiCalls) || []).length,
      functionalButtons: (content.match(patterns.functionalButtons) || []).length,
      alerts: (content.match(patterns.alertCalls) || []).length,
      errorHandling: (content.match(patterns.consoleErrors) || []).length,
      issues: []
    };
    
    // Analyse de la qualité des handlers
    if (results.hasOnClick && results.handlers === 0) {
      results.issues.push('onClick sans handler fonctionnel');
    }
    
    if (results.handlers > 0 && results.apiCalls === 0) {
      results.issues.push('Handlers sans appels API');
    }
    
    if (results.handlers > 0 && results.alerts === 0 && results.errorHandling === 0) {
      results.issues.push('Handlers sans gestion d\'erreurs');
    }
    
    return results;
  } catch (error) {
    return {
      file: filePath,
      error: error.message,
      issues: ['Erreur de lecture du fichier']
    };
  }
}

// Fonction pour trouver toutes les pages .tsx
function findAllPages(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findAllPages(filePath, fileList);
    } else if (file === 'page.tsx' && !filePath.includes('.next') && !filePath.includes('node_modules')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Fonction principale de validation
function validateAllHandlers() {
  console.log('🔍 Validation systématique de tous les handlers BMS...\n');
  
  const allPages = findAllPages(pagesDir);
  const results = allPages.map(analyzeHandlers);
  
  // Analyse par module
  const modules = {};
  results.forEach(result => {
    if (result.error) return;
    
    const modulePath = result.file.split('/src/app/')[1].split('/')[0];
    if (!modules[modulePath]) {
      modules[modulePath] = {
        pages: 0,
        totalHandlers: 0,
        totalApiCalls: 0,
        functionalButtons: 0,
        issues: []
      };
    }
    
    modules[modulePath].pages++;
    modules[modulePath].totalHandlers += result.handlers;
    modules[modulePath].totalApiCalls += result.apiCalls;
    modules[modulePath].functionalButtons += result.functionalButtons;
    modules[modulePath].issues.push(...result.issues);
  });
  
  // Affichage des résultats
  console.log('📊 RÉSULTATS PAR MODULE:\n');
  
  Object.entries(modules).forEach(([module, data]) => {
    const health = data.issues.length === 0 ? '✅ SAIN' : 
                  data.issues.length <= 2 ? '⚠️ ATTENTION' : '❌ CRITIQUE';
    
    console.log(`📁 ${module.toUpperCase()} ${health}`);
    console.log(`   Pages: ${data.pages}`);
    console.log(`   Handlers: ${data.totalHandlers}`);
    console.log(`   Appels API: ${data.totalApiCalls}`);
    console.log(`   FunctionalButtons: ${data.functionalButtons}`);
    
    if (data.issues.length > 0) {
      console.log(`   Problèmes: ${data.issues.length}`);
      data.issues.slice(0, 3).forEach(issue => {
        console.log(`     • ${issue}`);
      });
      if (data.issues.length > 3) {
        console.log(`     ... et ${data.issues.length - 3} autres`);
      }
    }
    console.log('');
  });
  
  // Résumé global
  const totalIssues = results.reduce((sum, r) => sum + (r.issues?.length || 0), 0);
  const totalHandlers = results.reduce((sum, r) => sum + (r.handlers || 0), 0);
  const totalApiCalls = results.reduce((sum, r) => sum + (r.apiCalls || 0), 0);
  
  console.log('🎯 RÉSUMÉ GLOBAL:');
  console.log(`   Pages analysées: ${results.length}`);
  console.log(`   Handlers totaux: ${totalHandlers}`);
  console.log(`   Appels API: ${totalApiCalls}`);
  console.log(`   Problèmes: ${totalIssues}`);
  
  const globalHealth = totalIssues === 0 ? '✅ PARFAIT' : 
                       totalIssues <= 5 ? '⚠️ BON' : '❌ NÉCESSITE TRAVAIL';
  
  console.log(`   État global: ${globalHealth}\n`);
  
  // Pages avec problèmes critiques
  const criticalPages = results.filter(r => r.issues && r.issues.length > 2);
  if (criticalPages.length > 0) {
    console.log('🚨 PAGES CRITIQUES À CORRIGER:');
    criticalPages.forEach(page => {
      const relativePath = page.file.split('/src/app/')[1];
      console.log(`   • ${relativePath} (${page.issues.length} problèmes)`);
    });
    console.log('');
  }
  
  // Export des résultats
  const report = {
    date: new Date().toISOString(),
    summary: {
      totalPages: results.length,
      totalHandlers,
      totalApiCalls,
      totalIssues,
      globalHealth
    },
    modules,
    criticalPages: criticalPages.map(p => ({
      file: p.file.split('/src/app/')[1],
      issues: p.issues
    }))
  };
  
  fs.writeFileSync(
    path.join(__dirname, '../handlers-validation-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('📄 Rapport détaillé sauvegardé: handlers-validation-report.json');
  
  return report;
}

// Exécution
if (require.main === module) {
  validateAllHandlers();
}

module.exports = { validateAllHandlers, analyzeHandlers };
