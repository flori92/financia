#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('💼 Modernisation du module Comptabilité...\n');

const accountingPages = [
  'app/accountant/journal/page.tsx',
  'app/accountant/trial-balance/page.tsx',
  'app/accountant/chart-of-accounts/page.tsx',
  'app/accountant/tax/vat/page.tsx',
  'app/accountant/bank/page.tsx',
  'app/accountant/close/page.tsx'
];

const srcDir = path.join(__dirname, '../bms-web/src');

accountingPages.forEach(pagePath => {
  const filePath = path.join(srcDir, pagePath);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Fichier non trouvé: ${pagePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Remplacer les TODO par getCompanyId()
  content = content.replace(
    /const companyId = ["']default-company["'];?\s*\/\/ TODO: récupérer depuis contexte/g,
    "const companyId = getCompanyId() || 'default-company';"
  );
  
  content = content.replace(
    /const userId = ['"][^'"]+['"];?\s*\/\/ TODO: récupérer du contexte/g,
    "const userId = localStorage.getItem('userId') || '';"
  );
  
  // Ajouter l'import getCompanyId si nécessaire
  if (content !== original && !content.includes('getCompanyId')) {
    const lines = content.split('\n');
    const apiImportIndex = lines.findIndex(line => line.includes("from '@/lib/api'"));
    
    if (apiImportIndex !== -1) {
      lines[apiImportIndex] = lines[apiImportIndex].replace(
        "from '@/lib/api'",
        ", getCompanyId } from '@/lib/api'"
      ).replace('import {', 'import { getCompanyId,');
    }
    
    content = lines.join('\n');
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Modernisé: ${pagePath}`);
  }
});

console.log('\n✨ Module Comptabilité modernisé!');
