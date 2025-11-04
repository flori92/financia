#!/usr/bin/env node

/**
 * Script pour protéger les pages avec le pattern ProtectedPage
 * Transforme: export default function Page() -> function PageContent() + export default function Page()
 */

const fs = require('fs');
const path = require('path');

function protectPageWithPattern(filePath) {
  try {
    console.log(`🔒 Protection de: ${path.relative(process.cwd(), filePath)}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si déjà protégée
    if (content.includes('ProtectedPage') || content.includes('AuthGuard')) {
      console.log(`   ✅ Déjà protégée`);
      return;
    }
    
    // Ajouter les imports nécessaires
    const importsToAdd = `import { useCompanyId } from '@/hooks/useCompanyId';
import { ProtectedPage } from '@/components/auth/ProtectedPage';`;
    
    // Trouver où insérer les imports (après les imports existants)
    const importRegex = /import\s+.*?\s+from\s+['"][^'"]+['"];?\s*/g;
    const imports = content.match(importRegex) || [];
    
    if (imports.length === 0) {
      console.log(`   ⚠️  Pas d'import trouvé`);
      return;
    }
    
    const lastImport = imports[imports.length - 1];
    const insertPosition = content.indexOf(lastImport) + lastImport.length;
    
    content = content.slice(0, insertPosition) + 
              '\n' + importsToAdd + '\n' + 
              content.slice(insertPosition);
    
    // Transformer export default function en function interne
    const exportFunctionMatch = content.match(/export\s+default\s+function\s+(\w+)\(/);
    if (!exportFunctionMatch) {
      console.log(`   ⚠️  Pas de export default function trouvé`);
      return;
    }
    
    const functionName = exportFunctionMatch[1];
    const contentFunctionName = functionName + 'Content';
    
    // Remplacer export default function par function
    content = content.replace(
      `export default function ${functionName}(`,
      `function ${contentFunctionName}(`
    );
    
    // Ajouter useCompanyId si pas présent
    if (!content.includes('const companyId = useCompanyId()')) {
      // Trouver la première ligne après function declaration
      const functionStart = content.indexOf(`function ${contentFunctionName}(`);
      const openingBrace = content.indexOf('{', functionStart);
      const firstLineEnd = content.indexOf('\n', openingBrace);
      
      content = content.slice(0, firstLineEnd + 1) + 
                '  const companyId = useCompanyId();\n' + 
                content.slice(firstLineEnd + 1);
    }
    
    // Remplacer getCompanyId() par companyId si présent
    content = content.replace(/getCompanyId\(\)/g, 'companyId');
    
    // Ajouter le wrapper à la fin du fichier
    const wrapperCode = `

export default function ${functionName}() {
  return (
    <ProtectedPage>
      <${contentFunctionName} />
    </ProtectedPage>
  );
}`;
    
    content += wrapperCode;
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   ✅ Protégée avec succès`);
    
  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`);
  }
}

// Pages critiques à protéger
const criticalPages = [
  'frontend/src/app/accountant/journal/page.tsx',
  'frontend/src/app/accountant/chart-of-accounts/page.tsx',
  'frontend/src/app/accountant/trial-balance/page.tsx',
  'frontend/src/app/accountant/profit-loss/page.tsx',
  'frontend/src/app/accountant/balance-sheet/page.tsx',
  'frontend/src/app/accountant/general-ledger/page.tsx',
  'frontend/src/app/accountant/bank/page.tsx',
  'frontend/src/app/accountant/tax/vat/page.tsx',
  'frontend/src/app/entrepreneur/page.tsx',
  'frontend/src/app/entrepreneur/direct-debits/page.tsx',
  'frontend/src/app/settings/page.tsx',
  'frontend/src/app/settings/users/page.tsx'
];

console.log('🚀 Protection des pages critiques avec pattern...\n');

criticalPages.forEach(pagePath => {
  const fullPath = path.join(__dirname, '..', pagePath);
  if (fs.existsSync(fullPath)) {
    protectPageWithPattern(fullPath);
  } else {
    console.log(`⚠️  Page non trouvée: ${pagePath}`);
  }
});

console.log('\n✅ Protection terminée !');
