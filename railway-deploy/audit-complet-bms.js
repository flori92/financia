#!/usr/bin/env node

/**
 * AUDIT COMPLET BMS - Backend + Frontend
 * Analyse complète du projet pour détecter incohérences et erreurs potentielles
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║        🔍 AUDIT COMPLET BMS - BACKEND + FRONTEND             ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// ===== PARTIE 1: ANALYSE BACKEND =====
console.log('\n━━━ 📦 PARTIE 1: ANALYSE BACKEND ━━━\n');

const backendPath = path.join(__dirname, 'backend/server.js');
const backendContent = fs.readFileSync(backendPath, 'utf-8');

const endpointRegex = /app\.(get|post|put|patch|delete)\(['"]([^'"]+)['"](?:,|\))/g;
const backendEndpoints = [];

let match;
while ((match = endpointRegex.exec(backendContent)) !== null) {
  backendEndpoints.push({
    method: match[1].toUpperCase(),
    path: match[2]
  });
}

console.log(`✅ Total endpoints backend: ${backendEndpoints.length}`);

// ===== PARTIE 2: ANALYSE FRONTEND =====
console.log('\n━━━ 🎨 PARTIE 2: ANALYSE FRONTEND ━━━\n');

const frontendPath = path.join(__dirname, 'frontend/src/app');
const findPages = (dir) => {
  let pages = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== 'node_modules') {
      pages = pages.concat(findPages(fullPath));
    } else if (item.name === 'page.tsx') {
      const route = fullPath.replace(frontendPath, '').replace('/page.tsx', '').replace(/\\/g, '/') || '/';
      pages.push({
        route,
        file: fullPath
      });
    }
  }
  return pages;
};

const frontendPages = findPages(frontendPath);
console.log(`✅ Total pages frontend: ${frontendPages.length}`);

// ===== PARTIE 3: ANALYSE DES APPELS API DANS LE FRONTEND =====
console.log('\n━━━ 🔗 PARTIE 3: ANALYSE APPELS API ━━━\n');

const apiCallsRegex = /(?:axios\.|fetch\(|api\.)(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
const apiCalls = new Set();

frontendPages.forEach(page => {
  try {
    const content = fs.readFileSync(page.file, 'utf-8');
    let apiMatch;
    const regex = /(?:axios\.|fetch\(|api\.)(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
    
    while ((apiMatch = regex.exec(content)) !== null) {
      const method = apiMatch[1].toUpperCase();
      let url = apiMatch[2];
      
      // Nettoyer l'URL (enlever variables template)
      url = url.replace(/\$\{[^}]+\}/g, ':param');
      
      apiCalls.add(`${method} ${url}`);
    }
  } catch (e) {
    // Ignore errors
  }
});

console.log(`✅ Total appels API détectés: ${apiCalls.size}`);

// ===== PARTIE 4: VÉRIFICATION DE COHÉRENCE =====
console.log('\n━━━ ⚠️  PARTIE 4: VÉRIFICATION DE COHÉRENCE ━━━\n');

const backendEndpointSet = new Set(
  backendEndpoints.map(ep => `${ep.method} ${ep.path}`)
);

const potentialMismatches = [];

// Vérifier si les appels API correspondent à des endpoints backend
apiCalls.forEach(call => {
  const [method, url] = call.split(' ');
  
  // Essayer de matcher avec les endpoints backend
  let found = backendEndpointSet.has(call);
  
  if (!found) {
    // Essayer avec paramètres
    const urlPattern = url.replace(/:param/g, '[^/]+');
    const regex = new RegExp(`^${urlPattern}$`);
    
    found = backendEndpoints.some(ep => 
      ep.method === method && regex.test(ep.path)
    );
  }
  
  if (!found) {
    potentialMismatches.push(call);
  }
});

if (potentialMismatches.length > 0) {
  console.log(`⚠️  ${potentialMismatches.length} appels API potentiellement sans endpoint backend:\n`);
  potentialMismatches.slice(0, 20).forEach(call => {
    console.log(`   ❌ ${call}`);
  });
  if (potentialMismatches.length > 20) {
    console.log(`   ... et ${potentialMismatches.length - 20} autres`);
  }
} else {
  console.log('✅ Tous les appels API semblent avoir un endpoint backend correspondant');
}

// ===== PARTIE 5: MODULES BACKEND SANS UTILISATION FRONTEND =====
console.log('\n━━━ 📊 PARTIE 5: ENDPOINTS BACKEND NON UTILISÉS ━━━\n');

const unusedEndpoints = [];
backendEndpoints.forEach(ep => {
  const epString = `${ep.method} ${ep.path}`;
  const isUsed = Array.from(apiCalls).some(call => {
    const [callMethod, callUrl] = call.split(' ');
    if (ep.method !== callMethod) return false;
    
    const urlPattern = callUrl.replace(/:param/g, '[^/]+');
    const regex = new RegExp(`^${urlPattern}$`);
    return regex.test(ep.path) || call === epString;
  });
  
  if (!isUsed && !ep.path.includes(':') && ep.path !== '/health') {
    unusedEndpoints.push(epString);
  }
});

if (unusedEndpoints.length > 0) {
  console.log(`ℹ️  ${unusedEndpoints.length} endpoints backend potentiellement non utilisés:\n`);
  unusedEndpoints.slice(0, 15).forEach(ep => {
    console.log(`   ⚪ ${ep}`);
  });
  if (unusedEndpoints.length > 15) {
    console.log(`   ... et ${unusedEndpoints.length - 15} autres`);
  }
} else {
  console.log('✅ Tous les endpoints backend semblent utilisés');
}

// ===== RAPPORT FINAL =====
console.log('\n\n╔══════════════════════════════════════════════════════════════╗');
console.log('║                    📋 RAPPORT FINAL                          ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

console.log(`📦 Backend:`);
console.log(`   - ${backendEndpoints.length} endpoints au total`);
console.log(`   - ${backendEndpoints.filter(e => e.method === 'GET').length} GET`);
console.log(`   - ${backendEndpoints.filter(e => e.method === 'POST').length} POST`);
console.log(`   - ${backendEndpoints.filter(e => e.method === 'PUT').length} PUT`);
console.log(`   - ${backendEndpoints.filter(e => e.method === 'PATCH').length} PATCH`);
console.log(`   - ${backendEndpoints.filter(e => e.method === 'DELETE').length} DELETE`);

console.log(`\n🎨 Frontend:`);
console.log(`   - ${frontendPages.length} pages`);
console.log(`   - ${apiCalls.size} appels API distincts`);

console.log(`\n⚠️  Problèmes potentiels:`);
console.log(`   - ${potentialMismatches.length} appels API sans endpoint backend`);
console.log(`   - ${unusedEndpoints.length} endpoints backend non utilisés`);

// Sauvegarder rapport détaillé
const report = {
  timestamp: new Date().toISOString(),
  backend: {
    totalEndpoints: backendEndpoints.length,
    endpoints: backendEndpoints
  },
  frontend: {
    totalPages: frontendPages.length,
    pages: frontendPages,
    apiCalls: Array.from(apiCalls)
  },
  issues: {
    potentialMismatches,
    unusedEndpoints
  }
};

const reportPath = path.join(__dirname, 'audit-bms-complet.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n✅ Rapport détaillé sauvegardé: audit-bms-complet.json`);
console.log('\n🎯 AUDIT TERMINÉ\n');
