#!/usr/bin/env node

/**
 * Script pour remplacer tous les fetch() par l'API client approprié
 */

const fs = require('fs');
const path = require('path');

const replacements = [
  // Communications
  { pattern: /fetch\(['"]\/api\/v1\/communications\/emails['"]\)\.then\(r => r\.json\(\)\)/g, replacement: 'communicationsAPI.getEmails()', api: 'communicationsAPI' },
  { pattern: /fetch\(['"]\/api\/v1\/communications\/templates['"]\)\.then\(r => r\.json\(\)\)/g, replacement: 'communicationsAPI.getTemplates()', api: 'communicationsAPI' },
  { pattern: /fetch\(['"]\/api\/v1\/communications\/sms['"]\)/g, replacement: 'communicationsAPI.getSMS()', api: 'communicationsAPI' },
  { pattern: /fetch\(['"]\/api\/v1\/communications\/whatsapp['"]\)/g, replacement: 'communicationsAPI.getWhatsApp()', api: 'communicationsAPI' },
  
  // Support
  { pattern: /fetch\(['"]\/api\/v1\/support\/tickets['"]\)/g, replacement: 'supportAPI.getTickets()', api: 'supportAPI' },
  
  // Marketing
  { pattern: /fetch\(['"]\/api\/v1\/marketing\/campaigns['"]\)/g, replacement: 'marketingAPI.getCampaigns()', api: 'marketingAPI' },
  
  // Companies
  { pattern: /fetch\(['"]\/api\/v1\/companies['"]\)/g, replacement: 'companiesAPI.getCompanies()', api: 'companiesAPI' },
  
  // AI
  { pattern: /fetch\(['"]\/api\/v1\/ai\/chat['"],\s*\{/g, replacement: 'aiAPI.chat(message, {', api: 'aiAPI' },
  
  // Invoices (déjà corrigé mais au cas où)
  { pattern: /fetch\(['"]\/api\/v1\/invoices['"]\)\.then\(r => \{[^}]*if \(!r\.ok\) return \[\];[^}]*return r\.json\(\);[^}]*\}\)\.catch\(\(\) => \[\]\)/gs, replacement: 'invoicesAPI.getInvoices().catch(() => [])', api: 'invoicesAPI' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const apisNeeded = new Set();

  replacements.forEach(({ pattern, replacement, api }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      apisNeeded.add(api);
      modified = true;
    }
  });

  if (modified) {
    // Vérifier si l'import existe déjà
    const hasImport = content.includes("from '@/lib/api-client'");
    
    if (!hasImport && apisNeeded.size > 0) {
      // Ajouter l'import
      const apis = Array.from(apisNeeded).join(', ');
      const importStatement = `import { ${apis} } from '@/lib/api-client';\n`;
      
      // Trouver où insérer (après les autres imports)
      const lines = content.split('\n');
      let insertIndex = 0;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          insertIndex = i + 1;
        } else if (insertIndex > 0 && !lines[i].startsWith('import ')) {
          break;
        }
      }
      
      lines.splice(insertIndex, 0, importStatement);
      content = lines.join('\n');
    } else if (hasImport && apisNeeded.size > 0) {
      // Mettre à jour l'import existant
      const importMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]@\/lib\/api-client['"]/);
      if (importMatch) {
        const existingApis = importMatch[1].split(',').map(s => s.trim());
        const allApis = new Set([...existingApis, ...Array.from(apisNeeded)]);
        const newImport = `import { ${Array.from(allApis).join(', ')} } from '@/lib/api-client'`;
        content = content.replace(importMatch[0], newImport);
      }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }

  return false;
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        fixedCount += walkDirectory(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (processFile(filePath)) {
        fixedCount++;
      }
    }
  });

  return fixedCount;
}

// Main execution
const targetDir = path.join(__dirname, '..', 'bms-web', 'src', 'app');

console.log('🔧 Correction des fetch() restants...\n');

const fixedCount = walkDirectory(targetDir);

console.log(`\n✨ Done! Fixed ${fixedCount} file(s).`);
