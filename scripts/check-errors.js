#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Vérification des erreurs potentielles...\n');

const srcDir = path.join(__dirname, '../bms-web/src');
const files = glob.sync(`${srcDir}/**/*.{ts,tsx}`, {
  ignore: ['**/node_modules/**', '**/.next/**']
});

const issues = {
  hardcodedUrls: [],
  mocks: [],
  todos: [],
  unusedImports: []
};

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(srcDir, file);
  
  // Vérifier les URLs hardcodées
  if (content.match(/['"`]http:\/\/localhost:3001/)) {
    issues.hardcodedUrls.push(relPath);
  }
  
  // Vérifier les mocks
  if (content.match(/const\s+mock[A-Z]/i) || content.match(/MOCK_[A-Z]/)) {
    issues.mocks.push(relPath);
  }
  
  // Vérifier les TODOs
  if (content.match(/\/\/\s*TODO/i)) {
    issues.todos.push(relPath);
  }
});

console.log('📊 Résultats de la vérification:\n');

console.log(`🔗 URLs hardcodées: ${issues.hardcodedUrls.length}`);
if (issues.hardcodedUrls.length > 0) {
  issues.hardcodedUrls.forEach(f => console.log(`   - ${f}`));
}

console.log(`\n🎭 Mocks restants: ${issues.mocks.length}`);
if (issues.mocks.length > 0) {
  issues.mocks.forEach(f => console.log(`   - ${f}`));
}

console.log(`\n📝 TODOs restants: ${issues.todos.length}`);
if (issues.todos.length > 0) {
  issues.todos.forEach(f => console.log(`   - ${f}`));
}

const totalIssues = issues.hardcodedUrls.length + issues.mocks.length + issues.todos.length;

if (totalIssues === 0) {
  console.log('\n✅ Aucun problème détecté!');
} else {
  console.log(`\n⚠️  ${totalIssues} problèmes détectés`);
}
