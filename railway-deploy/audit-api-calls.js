#!/usr/bin/env node

/**
 * Audit des appels API du frontend
 * Détecte tous les appels via apiGet, apiPost, etc.
 */

const fs = require('fs');
const path = require('path');

const frontendPath = path.join(__dirname, 'frontend/src');
const apiCalls = [];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Pattern pour détecter apiGet('/path'), apiPost('/path'), etc.
    const patterns = [
      /api(Get|Post|Put|Patch|Delete)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /api\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /fetch\s*\(\s*['"`]([^'"`]*\/api\/[^'"`]+)['"`]/g
    ];
    
    patterns.forEach((pattern, idx) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (idx === 2) {
          // fetch pattern
          apiCalls.push({
            file: filePath.replace(__dirname, ''),
            method: 'FETCH',
            path: match[1]
          });
        } else {
          apiCalls.push({
            file: filePath.replace(__dirname, ''),
            method: match[1].toUpperCase(),
            path: match[2]
          });
        }
      }
    });
  } catch (e) {
    // ignore
  }
}

function scanDirectory(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== 'node_modules' && item.name !== '.next') {
      scanDirectory(fullPath);
    } else if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.ts'))) {
      scanFile(fullPath);
    }
  }
}

console.log('🔍 Scan du frontend pour les appels API...\n');
scanDirectory(frontendPath);

// Grouper par endpoint
const grouped = {};
apiCalls.forEach(call => {
  const key = `${call.method} ${call.path}`;
  if (!grouped[key]) {
    grouped[key] = {
      endpoint: key,
      files: new Set()
    };
  }
  grouped[key].files.add(call.file);
});

// Afficher résultats
console.log(`✅ ${apiCalls.length} appels API détectés`);
console.log(`📊 ${Object.keys(grouped).length} endpoints uniques\n`);

console.log('━━━ ENDPOINTS APPELÉS ━━━\n');
Object.entries(grouped)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([key, data]) => {
    console.log(`  ${key}`);
    console.log(`    Utilisé dans ${data.files.size} fichier(s)`);
  });

// Sauvegarder
fs.writeFileSync(
  path.join(__dirname, 'frontend-api-calls.json'),
  JSON.stringify({ total: apiCalls.length, unique: Object.keys(grouped).length, calls: apiCalls, grouped }, null, 2)
);

console.log('\n✅ Rapport sauvegardé: frontend-api-calls.json');
