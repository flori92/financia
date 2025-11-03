#!/usr/bin/env node

/**
 * Audit Backend - Analyse de tous les endpoints
 * Génère un rapport complet des endpoints disponibles
 */

const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '../../server.js');
const serverContent = fs.readFileSync(serverPath, 'utf-8');

// Extraire tous les endpoints
const endpointRegex = /app\.(get|post|put|patch|delete)\(['"]([^'"]+)['"](?:,|\))/g;
const endpoints = [];

let match;
while ((match = endpointRegex.exec(serverContent)) !== null) {
  endpoints.push({
    method: match[1].toUpperCase(),
    path: match[2]
  });
}

// Grouper par module
const modules = {};
endpoints.forEach(ep => {
  const parts = ep.path.split('/').filter(p => p);
  const module = parts.length >= 3 ? parts[2] : 'root';
  
  if (!modules[module]) {
    modules[module] = [];
  }
  modules[module].push(ep);
});

// Générer rapport
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║       🔍 AUDIT BACKEND - INVENTAIRE DES ENDPOINTS        ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

console.log(`📊 Total endpoints: ${endpoints.length}\n`);

// Par module
Object.keys(modules).sort().forEach(module => {
  console.log(`\n━━━ 📦 Module: ${module.toUpperCase()} (${modules[module].length} endpoints) ━━━`);
  
  const grouped = {};
  modules[module].forEach(ep => {
    if (!grouped[ep.method]) grouped[ep.method] = [];
    grouped[ep.method].push(ep.path);
  });
  
  Object.keys(grouped).sort().forEach(method => {
    grouped[method].forEach(path => {
      console.log(`  ${method.padEnd(6)} ${path}`);
    });
  });
});

// Stats par méthode HTTP
console.log('\n\n━━━ 📊 STATISTIQUES PAR MÉTHODE HTTP ━━━');
const methods = {};
endpoints.forEach(ep => {
  methods[ep.method] = (methods[ep.method] || 0) + 1;
});

Object.keys(methods).sort().forEach(method => {
  console.log(`  ${method.padEnd(6)} : ${methods[method]} endpoints`);
});

// Générer fichier JSON
const outputPath = path.join(__dirname, 'endpoints-inventory.json');
fs.writeFileSync(outputPath, JSON.stringify({
  totalEndpoints: endpoints.length,
  modules,
  methods,
  endpoints: endpoints.sort((a, b) => a.path.localeCompare(b.path))
}, null, 2));

console.log(`\n✅ Rapport JSON généré: ${outputPath}`);
