#!/usr/bin/env node

/**
 * Script pour remplacer tous les appels API hardcodés par l'API client centralisé
 */

const fs = require('fs');
const path = require('path');

const replacements = [
  // Auth
  {
    pattern: /fetch\(['"]http:\/\/localhost:3001\/api\/v1\/auth\/login['"]/g,
    replacement: "authAPI.login",
    needsImport: true,
  },
  
  // Communications
  {
    pattern: /fetch\(['"]http:\/\/localhost:3001\/api\/v1\/communications\/emails['"]\)\.then\(r => r\.json\(\)\)/g,
    replacement: "communicationsAPI.getEmails()",
    needsImport: true,
  },
  {
    pattern: /fetch\(['"]http:\/\/localhost:3001\/api\/v1\/communications\/templates['"]\)\.then\(r => r\.json\(\)\)/g,
    replacement: "communicationsAPI.getTemplates()",
    needsImport: true,
  },
  {
    pattern: /fetch\(['"]http:\/\/localhost:3001\/api\/v1\/communications\/sms['"]\)/g,
    replacement: "communicationsAPI.getSMS()",
    needsImport: true,
  },
  {
    pattern: /fetch\(['"]http:\/\/localhost:3001\/api\/v1\/communications\/whatsapp['"]\)/g,
    replacement: "communicationsAPI.getWhatsApp()",
    needsImport: true,
  },
  
  // Invoices
  {
    pattern: /fetch\(['"]http:\/\/localhost:3001\/api\/v1\/invoices['"]\)/g,
    replacement: "invoicesAPI.getInvoices()",
    needsImport: true,
  },
  {
    pattern: /fetch\(['"]http:\/\/localhost:3001\/api\/v1\/invoices['"],\s*\{[^}]*method:\s*['"]POST['"]/g,
    replacement: "invoicesAPI.createInvoice",
    needsImport: true,
  },
  {
    pattern: /fetch\(`http:\/\/localhost:3001\/api\/v1\/invoices\/\$\{[^}]+\}\/send`/g,
    replacement: "invoicesAPI.sendInvoice",
    needsImport: true,
  },
  
  // CRM
  {
    pattern: /fetch\(['"]http:\/\/localhost:3001\/api\/v1\/crm\/contacts['"]\)/g,
    replacement: "crmAPI.getContacts()",
    needsImport: true,
  },
  
  // Budget
  {
    pattern: /fetch\(`http:\/\/localhost:3001\/api\/v1\/budget\/revisions`/g,
    replacement: "budgetAPI.createRevision",
    needsImport: true,
  },
  {
    pattern: /fetch\(`http:\/\/localhost:3001\/api\/v1\/budget\/new`/g,
    replacement: "budgetAPI.createBudget",
    needsImport: true,
  },
  
  // Support
  {
    pattern: /fetch\(['"]http:\/\/localhost:3001\/api\/v1\/support\/tickets['"]\)/g,
    replacement: "supportAPI.getTickets()",
    needsImport: true,
  },
  
  // Marketing
  {
    pattern: /fetch\(['"]http:\/\/localhost:3001\/api\/v1\/marketing\/campaigns['"]\)/g,
    replacement: "marketingAPI.getCampaigns()",
    needsImport: true,
  },
  
  // Treasury
  {
    pattern: /fetch\(`http:\/\/localhost:3001\/api\/v1\/treasury\/direct-debits\?companyId=\$\{companyId\}`\)/g,
    replacement: "treasuryAPI.getDirectDebits(companyId)",
    needsImport: true,
  },
  {
    pattern: /fetch\(`http:\/\/localhost:3001\/api\/v1\/treasury\/direct-debits\/statistics\?companyId=\$\{companyId\}`\)/g,
    replacement: "treasuryAPI.getDirectDebitStats(companyId)",
    needsImport: true,
  },
  
  // AI
  {
    pattern: /fetch\(['"]http:\/\/localhost:3001\/api\/v1\/ai\/chat['"]/g,
    replacement: "aiAPI.chat",
    needsImport: true,
  },
  {
    pattern: /fetch\(`http:\/\/localhost:3001\/api\/v1\/ai\/ocr\/\$\{selectedType\}`/g,
    replacement: "aiAPI.ocr",
    needsImport: true,
  },
  
  // Tax
  {
    pattern: /fetch\(\s*`http:\/\/localhost:3001\/api\/v1\/tax\/vat\/recalculate`/g,
    replacement: "taxAPI.recalculateVAT(companyId)",
    needsImport: true,
  },
  
  // Accounting
  {
    pattern: /fetch\(\s*`http:\/\/localhost:3001\/api\/v1\/accounting\/export\/chart-of-accounts\?companyId=\$\{companyId\}`/g,
    replacement: "accountingAPI.exportChartOfAccounts(companyId)",
    needsImport: true,
  },
  {
    pattern: /fetch\(\s*`http:\/\/localhost:3001\/api\/v1\/accounting\/export\/trial-balance\?companyId=\$\{companyId\}`/g,
    replacement: "accountingAPI.exportTrialBalance(companyId)",
    needsImport: true,
  },
  {
    pattern: /fetch\(\s*`http:\/\/localhost:3001\/api\/v1\/accounting\/export\/journal-entries\?companyId=\$\{companyId\}`/g,
    replacement: "accountingAPI.exportJournalEntries(companyId)",
    needsImport: true,
  },
  {
    pattern: /fetch\(['"]http:\/\/localhost:3001\/api\/v1\/accounting\/journal-entries['"]/g,
    replacement: "accountingAPI.createJournalEntry",
    needsImport: true,
  },
  
  // Banking
  {
    pattern: /fetch\(`http:\/\/localhost:3001\/api\/v1\/banking\/transactions\?companyId=\$\{companyId\}`\)/g,
    replacement: "bankingAPI.getTransactions(companyId)",
    needsImport: true,
  },
  {
    pattern: /fetch\(['"]http:\/\/localhost:3001\/api\/v1\/banking\/auto-match['"]/g,
    replacement: "bankingAPI.autoMatch",
    needsImport: true,
  },
  {
    pattern: /fetch\(['"]http:\/\/localhost:3001\/api\/v1\/banking\/reconcile-entry['"]/g,
    replacement: "bankingAPI.reconcileEntry",
    needsImport: true,
  },
  
  // Uploads
  {
    pattern: /let url = `http:\/\/localhost:3001\/api\/v1\/uploads\?`/g,
    replacement: "// Using uploadsAPI.upload instead",
    needsImport: true,
  },
  
  // Companies
  {
    pattern: /fetch\(['"]http:\/\/localhost:3001\/api\/v1\/companies['"]\)/g,
    replacement: "companiesAPI.getCompanies()",
    needsImport: true,
  },
  {
    pattern: /fetch\(['"]http:\/\/localhost:3001\/api\/v1\/companies['"],\s*\{/g,
    replacement: "companiesAPI.createCompany",
    needsImport: true,
  },
  
  // API URL constants
  {
    pattern: /const API_URL = process\.env\.NEXT_PUBLIC_API_URL \|\| ['"]http:\/\/localhost:3001['"]/g,
    replacement: "// Using centralized API client",
    needsImport: false,
  },
];

function addImportIfNeeded(content, filePath) {
  // Check if import already exists
  if (content.includes("from '@/lib/api-client'")) {
    return content;
  }
  
  // Determine which APIs are needed based on content
  const neededAPIs = [];
  if (content.includes('authAPI')) neededAPIs.push('authAPI');
  if (content.includes('communicationsAPI')) neededAPIs.push('communicationsAPI');
  if (content.includes('invoicesAPI')) neededAPIs.push('invoicesAPI');
  if (content.includes('crmAPI')) neededAPIs.push('crmAPI');
  if (content.includes('budgetAPI')) neededAPIs.push('budgetAPI');
  if (content.includes('supportAPI')) neededAPIs.push('supportAPI');
  if (content.includes('marketingAPI')) neededAPIs.push('marketingAPI');
  if (content.includes('treasuryAPI')) neededAPIs.push('treasuryAPI');
  if (content.includes('aiAPI')) neededAPIs.push('aiAPI');
  if (content.includes('taxAPI')) neededAPIs.push('taxAPI');
  if (content.includes('accountingAPI')) neededAPIs.push('accountingAPI');
  if (content.includes('bankingAPI')) neededAPIs.push('bankingAPI');
  if (content.includes('uploadsAPI')) neededAPIs.push('uploadsAPI');
  if (content.includes('companiesAPI')) neededAPIs.push('companiesAPI');
  
  if (neededAPIs.length === 0) {
    return content;
  }
  
  // Find the last import statement
  const importRegex = /import\s+.*?from\s+['"].*?['"];?\n/g;
  const imports = content.match(importRegex);
  
  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertPosition = lastImportIndex + lastImport.length;
    
    const newImport = `import { ${neededAPIs.join(', ')} } from '@/lib/api-client';\n`;
    
    return content.slice(0, insertPosition) + newImport + content.slice(insertPosition);
  }
  
  // If no imports found, add at the beginning after 'use client' if present
  if (content.includes("'use client'")) {
    return content.replace("'use client';\n", `'use client';\n\nimport { ${neededAPIs.join(', ')} } from '@/lib/api-client';\n`);
  }
  
  return `import { ${neededAPIs.join(', ')} } from '@/lib/api-client';\n\n` + content;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Apply all replacements
  replacements.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });
  
  // Add import if needed
  if (modified) {
    content = addImportIfNeeded(content, filePath);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

function walkDirectory(dir, filePattern = /\.(tsx?|jsx?)$/) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        fixedCount += walkDirectory(filePath, filePattern);
      }
    } else if (filePattern.test(file)) {
      if (processFile(filePath)) {
        fixedCount++;
      }
    }
  });
  
  return fixedCount;
}

// Main execution
const targetDir = path.join(__dirname, '..', 'bms-web', 'src');

console.log('🔧 Fixing hardcoded API URLs...\n');
console.log(`Target directory: ${targetDir}\n`);

const fixedCount = walkDirectory(targetDir);

console.log(`\n✨ Done! Fixed ${fixedCount} file(s).`);
