#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Suppression de TOUS les mocks restants...\n');

const srcDir = path.join(__dirname, '../bms-web/src');

const fixes = [
  // Revenue Recognition
  {
    file: 'app/accountant/revenue-recognition/page.tsx',
    search: /const mockData: RevenueData\[\][\s\S]*?setRevenueData\(mockData\);/,
    replace: `const companyId = getCompanyId();\n      const data = await apiGet('/api/v1/accounting/revenue-recognition', { companyId });\n      setRevenueData(data);`,
    addImport: true
  },
  
  // Multi-dimensional Analysis
  {
    file: 'app/accountant/multi-dimensional-analysis/page.tsx',
    search: /const mockData: MultiDimensionalData[\s\S]*?setData\(mockData\);/,
    replace: `const companyId = getCompanyId();\n      const data = await apiGet('/api/v1/accounting/multi-dimensional-analysis', { companyId });\n      setData(data);`,
    addImport: true
  },
  
  // Bank Partner
  {
    file: 'app/bank-partner/page.tsx',
    search: /const mockData: BankPartnerData[\s\S]*?setData\(mockData\);/,
    replace: `const companyId = getCompanyId();\n      const data = await apiGet('/api/v1/banking/partner-dashboard', { companyId });\n      setData(data);`,
    addImport: true
  },
  
  // Settings Users
  {
    file: 'app/settings/users/page.tsx',
    search: /const MOCK_USERS[\s\S]*?\];/,
    replace: `const [users, setUsers] = useState([]);\n\n  useEffect(() => {\n    apiGet('/api/v1/users').then(data => setUsers(data)).catch(console.error);\n  }, []);`,
    removeOldState: true,
    addImport: true
  }
];

let fixedCount = 0;

fixes.forEach(({ file: relPath, search, replace, addImport, removeOldState }) => {
  const filePath = path.join(srcDir, relPath);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Fichier non trouvé: ${relPath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Appliquer le remplacement
  content = content.replace(search, replace);
  
  // Supprimer l'ancien state si nécessaire
  if (removeOldState) {
    content = content.replace(/const \[users, setUsers\] = useState\(MOCK_USERS\);/, '');
  }
  
  // Ajouter les imports si nécessaire
  if (addImport && content !== original) {
    if (!content.includes("from '@/lib/api'")) {
      const lines = content.split('\n');
      let insertIndex = 0;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ') || lines[i].includes('use client')) {
          insertIndex = i + 1;
        } else if (insertIndex > 0 && lines[i].trim() === '') {
          break;
        }
      }
      
      lines.splice(insertIndex, 0, "import { apiGet, apiPost, apiPatch, apiDelete, getCompanyId } from '@/lib/api';");
      content = lines.join('\n');
    } else if (!content.includes('getCompanyId')) {
      content = content.replace(
        "from '@/lib/api'",
        ", getCompanyId } from '@/lib/api'"
      ).replace(
        'import {',
        'import { getCompanyId,'
      );
    }
    
    // Ajouter useEffect si nécessaire
    if (removeOldState && !content.includes('useEffect')) {
      content = content.replace(
        "from 'react'",
        ", useEffect } from 'react'"
      ).replace(
        'import {',
        'import { useEffect,'
      );
    }
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Mock supprimé: ${relPath}`);
    fixedCount++;
  }
});

console.log(`\n✨ ${fixedCount} mocks supprimés!`);
