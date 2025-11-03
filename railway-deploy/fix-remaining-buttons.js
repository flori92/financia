#!/usr/bin/env node

/**
 * Correction des boutons restants sans onClick
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  '/frontend/src/app/marketing/campaigns/page.tsx',
  '/frontend/src/app/sales/clients/page.tsx',
  '/frontend/src/app/support/tickets/page.tsx'
];

const buttonFixes = [
  {
    file: '/frontend/src/app/marketing/campaigns/page.tsx',
    pattern: /<Button className="bg-teal-600 hover:bg-teal-700">\s*<Plus className="w-4 h-4 mr-2" \/>\s*Nouvelle Campagne\s*<\/Button>/gs,
    replacement: '<Button className="bg-teal-600 hover:bg-teal-700" onClick={() => alert("Fonctionnalité en développement : Nouvelle Campagne")}>\n          <Plus className="w-4 h-4 mr-2" />\n          Nouvelle Campagne\n        </Button>'
  },
  {
    file: '/frontend/src/app/sales/clients/page.tsx',
    pattern: /<Button className="bg-blue-600 hover:bg-blue-700">\s*<Plus className="w-4 h-4 mr-2" \/>\s*Nouveau Client\s*<\/Button>/gs,
    replacement: '<Button className="bg-blue-600 hover:bg-blue-700" onClick={() => alert("Fonctionnalité en développement : Nouveau Client")}>\n            <Plus className="w-4 h-4 mr-2" />\n            Nouveau Client\n          </Button>'
  }
];

let fixedCount = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf-8');
    const originalContent = content;
    
    // Appliquer les corrections spécifiques
    buttonFixes.forEach(fix => {
      if (fix.file === filePath) {
        if (fix.pattern.test(content)) {
          content = content.replace(fix.pattern, fix.replacement);
          console.log(`✅ Bouton corrigé dans ${filePath}`);
          fixedCount++;
        }
      }
    });
    
    // Correction générique pour les autres boutons sans onClick
    const genericButtonPattern = /<Button([^>]*)className="([^"]*)"(?![^>]*onClick=)([^>]*)>([^<]+)<\/Button>/g;
    const matches = content.match(genericButtonPattern);
    
    if (matches) {
      matches.forEach(match => {
        const buttonText = match.match(/>([^<]+)</)[1];
        if (buttonText.trim()) {
          const fixedButton = match.replace(
            /<Button([^>]*)className="([^"]*)"([^>]*)>([^<]+)<\/Button>/,
            `<Button$1className="$2"$3 onClick={() => alert("Fonctionnalité en développement : $4")}>$4</Button>`
          );
          content = content.replace(match, fixedButton);
          console.log(`✅ Bouton générique corrigé dans ${filePath}: "${buttonText.trim()}"`);
          fixedCount++;
        }
      });
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
    }
    
  } catch (e) {
    console.error(`❌ Erreur fichier ${filePath}:`, e.message);
  }
});

console.log(`\n📊 RÉSULTAT: ${fixedCount} boutons corrigés`);
console.log(`\n🎉 Terminé !`);
