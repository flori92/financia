const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Analyse de tous les boutons BMS\n');

const srcDir = path.join(__dirname, 'bms-web/src');
const files = glob.sync(`${srcDir}/**/*.{tsx,ts}`, {
  ignore: ['**/node_modules/**', '**/.next/**']
});

const issues = [];
const buttons = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(srcDir, file);
  
  // Trouver tous les boutons
  const buttonMatches = content.matchAll(/<[Bb]utton[^>]*onClick={([^}]+)}[^>]*>([^<]*)</g);
  
  for (const match of buttonMatches) {
    const handler = match[1];
    const label = match[2].trim();
    
    buttons.push({ file: relPath, handler, label });
    
    // Vérifier si le handler existe
    if (handler.includes('undefined') || handler.includes('null')) {
      issues.push({
        file: relPath,
        type: 'UNDEFINED_HANDLER',
        label,
        handler
      });
    }
    
    // Vérifier les handlers vides
    if (handler.trim() === '() => {}' || handler.trim() === '() => { }') {
      issues.push({
        file: relPath,
        type: 'EMPTY_HANDLER',
        label,
        handler
      });
    }
    
    // Vérifier les console.log
    if (content.includes(handler) && content.match(new RegExp(`${handler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^}]*console\\.log`))) {
      issues.push({
        file: relPath,
        type: 'CONSOLE_LOG',
        label,
        handler
      });
    }
  }
  
  // Vérifier les boutons avec disabled sans raison
  const disabledButtons = content.matchAll(/<[Bb]utton[^>]*disabled[^>]*>/g);
  for (const match of disabledButtons) {
    if (!match[0].includes('loading') && !match[0].includes('isLoading')) {
      const labelMatch = match[0].match(/>([^<]+)</);
      if (labelMatch) {
        issues.push({
          file: relPath,
          type: 'ALWAYS_DISABLED',
          label: labelMatch[1].trim()
        });
      }
    }
  }
});

console.log(`📊 Statistiques:\n`);
console.log(`   Total boutons trouvés: ${buttons.length}`);
console.log(`   Fichiers analysés: ${files.length}`);
console.log(`   Problèmes détectés: ${issues.length}\n`);

if (issues.length > 0) {
  console.log('⚠️  Problèmes détectés:\n');
  
  const byType = {};
  issues.forEach(issue => {
    if (!byType[issue.type]) byType[issue.type] = [];
    byType[issue.type].push(issue);
  });
  
  Object.keys(byType).forEach(type => {
    console.log(`\n${type} (${byType[type].length}):`);
    byType[type].slice(0, 10).forEach(issue => {
      console.log(`   - ${issue.file}`);
      console.log(`     Label: "${issue.label}"`);
      if (issue.handler) console.log(`     Handler: ${issue.handler}`);
    });
    if (byType[type].length > 10) {
      console.log(`   ... et ${byType[type].length - 10} autres`);
    }
  });
} else {
  console.log('✅ Aucun problème détecté!');
}

// Sauvegarder le rapport
const report = {
  date: new Date().toISOString(),
  totalButtons: buttons.length,
  totalFiles: files.length,
  issues: issues,
  buttons: buttons
};

fs.writeFileSync('button-analysis-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Rapport sauvegardé: button-analysis-report.json');
