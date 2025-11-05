#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('💰 Modernisation du module Trésorerie...\n');

const srcDir = path.join(__dirname, '../bms-web/src');

// Trouver tous les fichiers de trésorerie
const treasuryFiles = glob.sync(`${srcDir}/app/**/treasury/**/*.{ts,tsx}`, {
  ignore: ['**/node_modules/**', '**/.next/**']
});

const entrepreneurFiles = glob.sync(`${srcDir}/app/entrepreneur/**/*.{ts,tsx}`, {
  ignore: ['**/node_modules/**', '**/.next/**']
});

const allFiles = [...treasuryFiles, ...entrepreneurFiles];

let fixedCount = 0;

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Remplacer les appels hardcodés
  content = content.replace(
    /fetch\s*\(\s*`http:\/\/localhost:3001(\/api\/v1\/treasury\/[^`]+)`\)/g,
    "apiGet('$1')"
  );
  
  content = content.replace(
    /fetch\s*\(\s*`http:\/\/localhost:3001(\/api\/v1\/treasury\/[^`]+)`\s*,\s*\{[^}]*method:\s*['"]POST['"][^}]*\}\)/g,
    "apiPost('$1', data)"
  );
  
  // Ajouter l'import si nécessaire
  if (content !== original && !content.includes("from '@/lib/api'")) {
    const importStatement = "import { apiGet, apiPost, apiPatch, apiDelete, getCompanyId } from '@/lib/api';\n";
    const lines = content.split('\n');
    let insertIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].includes('use client')) {
        insertIndex = i + 1;
      } else if (insertIndex > 0 && lines[i].trim() === '') {
        break;
      }
    }
    
    lines.splice(insertIndex, 0, importStatement);
    content = lines.join('\n');
  }
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Modernisé: ${path.relative(srcDir, file)}`);
    fixedCount++;
  }
});

console.log(`\n✨ ${fixedCount} fichiers de trésorerie modernisés!`);
