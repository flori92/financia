#!/usr/bin/env node

/**
 * Script pour analyser tous les boutons du frontend BMS
 * et vérifier qu'ils ont des handlers fonctionnels
 */

const fs = require('fs');
const path = require('path');

const ISSUES = {
  NO_HANDLER: [],
  EMPTY_HANDLER: [],
  CONSOLE_LOG_ONLY: [],
  ALERT_ONLY: [],
  TODO_COMMENT: [],
  MOCK_DATA: [],
  WORKING: [],
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const buttons = [];
  
  // Trouver tous les boutons
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Boutons avec onClick
    if (line.includes('onClick=') || line.includes('onSubmit=')) {
      const match = line.match(/onClick=\{([^}]+)\}|onSubmit=\{([^}]+)\}/);
      if (match) {
        const handler = match[1] || match[2];
        buttons.push({
          file: filePath,
          line: lineNum,
          handler: handler.trim(),
          context: line.trim(),
        });
      }
    }
  });
  
  // Analyser chaque bouton
  buttons.forEach(button => {
    const handler = button.handler;
    
    // Vérifier si le handler existe dans le fichier
    const handlerName = handler.replace(/\(.*\)/, '').replace('() => ', '');
    
    if (handler === '() => {}' || handler === '() => { }') {
      ISSUES.EMPTY_HANDLER.push(button);
    } else if (handler.includes('console.log') && !handler.includes('api') && !handler.includes('fetch')) {
      ISSUES.CONSOLE_LOG_ONLY.push(button);
    } else if (handler.includes('alert(') && !handler.includes('api') && !handler.includes('fetch')) {
      ISSUES.ALERT_ONLY.push(button);
    } else if (content.includes(`// TODO`) && content.includes(handlerName)) {
      ISSUES.TODO_COMMENT.push(button);
    } else if (content.includes('mock') && content.includes(handlerName)) {
      ISSUES.MOCK_DATA.push(button);
    } else {
      // Vérifier si le handler fait un vrai appel API
      const handlerRegex = new RegExp(`(const|function)\\s+${handlerName}`, 'g');
      if (handlerRegex.test(content)) {
        const handlerContent = extractHandlerContent(content, handlerName);
        if (handlerContent.includes('api') || handlerContent.includes('fetch') || handlerContent.includes('router.push')) {
          ISSUES.WORKING.push(button);
        } else {
          ISSUES.NO_HANDLER.push(button);
        }
      } else {
        ISSUES.WORKING.push(button); // Inline handler
      }
    }
  });
}

function extractHandlerContent(content, handlerName) {
  const regex = new RegExp(`(const|function)\\s+${handlerName}[^{]*\\{([^}]+)\\}`, 's');
  const match = content.match(regex);
  return match ? match[2] : '';
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        walkDirectory(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      analyzeFile(filePath);
    }
  });
}

// Main execution
const targetDir = path.join(__dirname, '..', 'bms-web', 'src', 'app');

console.log('🔍 Analyse des boutons BMS...\n');
console.log(`📂 Répertoire: ${targetDir}\n`);

walkDirectory(targetDir);

// Afficher les résultats
console.log('═══════════════════════════════════════════════════');
console.log('📊 RÉSULTATS DE L\'ANALYSE');
console.log('═══════════════════════════════════════════════════\n');

console.log(`✅ Boutons fonctionnels: ${ISSUES.WORKING.length}`);
console.log(`⚠️  Handlers vides: ${ISSUES.EMPTY_HANDLER.length}`);
console.log(`⚠️  Console.log seulement: ${ISSUES.CONSOLE_LOG_ONLY.length}`);
console.log(`⚠️  Alert seulement: ${ISSUES.ALERT_ONLY.length}`);
console.log(`⚠️  TODO comments: ${ISSUES.TODO_COMMENT.length}`);
console.log(`⚠️  Mock data: ${ISSUES.MOCK_DATA.length}`);
console.log(`❌ Pas de handler: ${ISSUES.NO_HANDLER.length}\n`);

// Détails des problèmes
if (ISSUES.EMPTY_HANDLER.length > 0) {
  console.log('⚠️  HANDLERS VIDES:');
  ISSUES.EMPTY_HANDLER.slice(0, 5).forEach(btn => {
    console.log(`  ${btn.file}:${btn.line}`);
    console.log(`    ${btn.context.substring(0, 80)}...`);
  });
  if (ISSUES.EMPTY_HANDLER.length > 5) {
    console.log(`  ... et ${ISSUES.EMPTY_HANDLER.length - 5} autres\n`);
  }
}

if (ISSUES.CONSOLE_LOG_ONLY.length > 0) {
  console.log('\n⚠️  CONSOLE.LOG SEULEMENT:');
  ISSUES.CONSOLE_LOG_ONLY.slice(0, 5).forEach(btn => {
    console.log(`  ${btn.file}:${btn.line}`);
  });
  if (ISSUES.CONSOLE_LOG_ONLY.length > 5) {
    console.log(`  ... et ${ISSUES.CONSOLE_LOG_ONLY.length - 5} autres\n`);
  }
}

if (ISSUES.NO_HANDLER.length > 0) {
  console.log('\n❌ PAS DE HANDLER:');
  ISSUES.NO_HANDLER.slice(0, 5).forEach(btn => {
    console.log(`  ${btn.file}:${btn.line}`);
    console.log(`    Handler: ${btn.handler}`);
  });
  if (ISSUES.NO_HANDLER.length > 5) {
    console.log(`  ... et ${ISSUES.NO_HANDLER.length - 5} autres\n`);
  }
}

console.log('\n═══════════════════════════════════════════════════');

const totalButtons = Object.values(ISSUES).reduce((sum, arr) => sum + arr.length, 0);
const workingPercentage = ((ISSUES.WORKING.length / totalButtons) * 100).toFixed(1);

console.log(`\n📈 SCORE: ${workingPercentage}% des boutons sont fonctionnels`);
console.log(`📊 Total: ${totalButtons} boutons analysés\n`);

if (workingPercentage >= 90) {
  console.log('✅ Excellent ! La plupart des boutons sont fonctionnels.\n');
  process.exit(0);
} else if (workingPercentage >= 70) {
  console.log('⚠️  Bon, mais quelques boutons nécessitent attention.\n');
  process.exit(0);
} else {
  console.log('❌ Attention ! Beaucoup de boutons ne sont pas fonctionnels.\n');
  process.exit(1);
}
