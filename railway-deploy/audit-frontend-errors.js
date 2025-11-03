#!/usr/bin/env node

/**
 * Audit des Erreurs JavaScript Frontend
 * Détecte les problèmes potentiels qui causent des erreurs runtime
 */

const fs = require('fs');
const path = require('path');

const frontendPath = path.join(__dirname, 'frontend/src');
const issues = [];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Pattern pour détecter .toLocaleString() sans vérification
      if (line.includes('.toLocaleString(')) {
        // Vérifier si la ligne a une validation de null/undefined avant
        const before = line.substring(0, line.indexOf('.toLocaleString'));
        const hasNullCheck = 
          before.includes('!= null') || 
          before.includes('!== null') || 
          before.includes('!= undefined') || 
          before.includes('!== undefined') ||
          before.includes('?') ||
          before.includes('||');
        
        if (!hasNullCheck) {
          issues.push({
            file: filePath.replace(__dirname, ''),
            line: index + 1,
            content: line.trim(),
            issue: 'toLocaleString() sans validation null/undefined',
            severity: 'high'
          });
        }
      }
      
      // Pattern pour détecter .map() sur potentiellement undefined
      const mapMatch = line.match(/(\w+)\.map\(/);
      if (mapMatch) {
        const varName = mapMatch[1];
        // Vérifier si la variable est validée avant le map
        const beforeMap = line.substring(0, line.indexOf('.map('));
        const hasValidation = 
          beforeMap.includes('?') ||
          beforeMap.includes('||') ||
          beforeMap.includes('&&') ||
          beforeMap.includes('if');
        
        if (!hasValidation && !line.includes('Array.isArray')) {
          issues.push({
            file: filePath.replace(__dirname, ''),
            line: index + 1,
            content: line.trim(),
            issue: `.map() sur variable potentiellement undefined (${varName})`,
            severity: 'medium'
          });
        }
      }
      
      // Pattern pour détecter accès à propriété sans validation
      const propAccessMatch = line.match(/(\w+)\.\w+/g);
      if (propAccessMatch) {
        propAccessMatch.forEach(match => {
          const [objName] = match.split('.');
          if (objName && !line.includes('?.') && !line.includes('?')) {
            // C'est un accès potentiellement unsafe
            if (line.includes(objName + '.')) {
              issues.push({
                file: filePath.replace(__dirname, ''),
                line: index + 1,
                content: line.trim(),
                issue: `Accès propriété sans validation: ${objName}.xxx`,
                severity: 'low'
              });
            }
          }
        });
      }
    });
  } catch (e) {
    // ignore
  }
}

function scanDirectory(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== 'node_modules' && item.name !== '.next') {
      scanDirectory(fullPath);
    } else if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.ts'))) {
      scanFile(fullPath);
    }
  }
}

console.log('🔍 Scan des erreurs JavaScript potentielles...\n');
scanDirectory(frontendPath);

// Grouper par sévérité
const highSeverity = issues.filter(i => i.severity === 'high');
const mediumSeverity = issues.filter(i => i.severity === 'medium');
const lowSeverity = issues.filter(i => i.severity === 'low');

console.log(`✅ ${issues.length} problèmes potentiels détectés\n`);

if (highSeverity.length > 0) {
  console.log('🔴 PROBLÈMES CRITIQUES (Peuvent causer des erreurs runtime):\n');
  highSeverity.forEach(issue => {
    console.log(`❌ ${issue.file}:${issue.line}`);
    console.log(`   ${issue.content}`);
    console.log(`   ⚠️  ${issue.issue}\n`);
  });
}

if (mediumSeverity.length > 0) {
  console.log('🟡 PROBLÈMES MOYENS (Risques potentiels):\n');
  mediumSeverity.slice(0, 10).forEach(issue => {
    console.log(`⚠️  ${issue.file}:${issue.line}`);
    console.log(`   ${issue.content}`);
    console.log(`   ${issue.issue}\n`);
  });
  if (mediumSeverity.length > 10) {
    console.log(`   ... et ${mediumSeverity.length - 10} autres\n`);
  }
}

if (lowSeverity.length > 0) {
  console.log('🟢 PROBLÈMES FAIBLES (Améliorations suggérées):\n');
  console.log(`   ${lowSeverity.length} accès propriétés sans validation optionnelle\n`);
}

// Sauvegarder
fs.writeFileSync(
  path.join(__dirname, 'frontend-errors-report.json'),
  JSON.stringify({ 
    total: issues.length,
    high: highSeverity.length,
    medium: mediumSeverity.length,
    low: lowSeverity.length,
    issues 
  }, null, 2)
);

console.log(`\n✅ Rapport sauvegardé: frontend-errors-report.json\n`);

if (highSeverity.length > 0) {
  console.log('🎯 RECOMMANDATION PRIORITAIRE:');
  console.log('Corriger les problèmes critiques pour éliminer les erreurs JavaScript runtime.\n');
} else {
  console.log('🎉 Aucun problème critique détecté !\n');
}
