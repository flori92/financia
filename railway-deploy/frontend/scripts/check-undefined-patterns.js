#!/usr/bin/env node

/**
 * Script de vérification automatique des patterns à risque d'undefined
 * 
 * Ce script scanne le code source à la recherche de patterns qui pourraient
 * causer des erreurs "Cannot read properties of undefined"
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns à risque
const RISKY_PATTERNS = [
  {
    name: 'toLocaleString sans protection',
    pattern: /\.toLocaleString\(\)/g,
    severity: 'HIGH',
    suggestion: 'Utiliser (value || 0).toLocaleString("fr-FR")'
  },
  {
    name: 'Accès direct à propriété potentiellement undefined',
    pattern: /data\?\.[a-zA-Z_][a-zA-Z0-9_]*\.toLocaleString\(\)/g,
    severity: 'HIGH',
    suggestion: 'Utiliser (data?.property || 0).toLocaleString("fr-FR")'
  },
  {
    name: 'toFixed sans protection',
    pattern: /\.toFixed\([0-9]+\)/g,
    severity: 'MEDIUM',
    suggestion: 'Utiliser (value || 0).toFixed(n)'
  },
  {
    name: 'Map sur array potentiellement undefined',
    pattern: /\.map\([^)]*\)\.filter\([^)]*\)\.reduce\([^)]*\)/g,
    severity: 'MEDIUM',
    suggestion: 'Protéger chaque étape avec || 0'
  }
];

// Extensions de fichiers à scanner
const FILE_EXTENSIONS = ['*.tsx', '*.ts', '*.jsx', '*.js'];

// Dossiers à exclure
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build'];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  RISKY_PATTERNS.forEach(({ name, pattern, severity, suggestion }) => {
    const matches = [...content.matchAll(pattern)];
    
    if (matches.length > 0) {
      matches.forEach(match => {
        const lines = content.substring(0, match.index).split('\n');
        const lineNumber = lines.length;
        const lineContent = lines[lines.length - 1].trim();
        
        issues.push({
          type: name,
          severity,
          line: lineNumber,
          content: lineContent,
          match: match[0],
          suggestion
        });
      });
    }
  });

  return issues;
}

function scanDirectory(dirPath) {
  const pattern = `${dirPath}/**/{${FILE_EXTENSIONS.join(',')}}`;
  const options = {
    ignore: EXCLUDE_DIRS.map(dir => `${dir}/**`),
    absolute: true
  };

  const files = glob.sync(pattern, options);
  const allIssues = [];

  console.log(`🔍 Scan de ${files.length} fichiers dans ${dirPath}...\n`);

  files.forEach(filePath => {
    const relativePath = path.relative(process.cwd(), filePath);
    const issues = scanFile(filePath);
    
    if (issues.length > 0) {
      console.log(`📁 ${relativePath}`);
      issues.forEach(issue => {
        const icon = issue.severity === 'HIGH' ? '🚨' : '⚠️';
        console.log(`  ${icon} L${issue.line}: ${issue.type}`);
        console.log(`     Code: ${issue.content}`);
        console.log(`     💡 Suggestion: ${issue.suggestion}`);
        console.log('');
      });
      
      allIssues.push(...issues.map(issue => ({ ...issue, file: relativePath })));
    }
  });

  return allIssues;
}

function main() {
  console.log('🛡️  BMS - Vérification des patterns à risque d\'undefined\n');
  console.log('Analyse du code source pour prévenir les erreurs runtime...\n');

  const srcPath = path.join(process.cwd(), 'src');
  const allIssues = scanDirectory(srcPath);

  // Résumé
  const highSeverity = allIssues.filter(i => i.severity === 'HIGH').length;
  const mediumSeverity = allIssues.filter(i => i.severity === 'MEDIUM').length;

  console.log('📊 RÉSUMÉ DE L\'ANALYSE');
  console.log('='.repeat(50));
  console.log(`🚨 Problèmes de haute sévérité: ${highSeverity}`);
  console.log(`⚠️  Problèmes de moyenne sévérité: ${mediumSeverity}`);
  console.log(`📋 Total des problèmes: ${allIssues.length}`);

  if (allIssues.length === 0) {
    console.log('\n✅ Aucun problème détecté ! Le code est sécurisé.');
    process.exit(0);
  } else {
    console.log('\n🔧 ACTIONS RECOMMANDÉES:');
    console.log('1. Corriger les problèmes de haute sévérité en priorité');
    console.log('2. Ajouter des protections (|| 0) sur toutes les valeurs externes');
    console.log('3. Utiliser toLocaleString("fr-FR") pour le formatage français');
    console.log('4. Tester les pages avec des données API vides ou incomplètes');
    
    if (highSeverity > 0) {
      console.log('\n❌ ÉCHEC: Des problèmes critiques détectés !');
      process.exit(1);
    } else {
      console.log('\n⚠️  AVERTISSEMENT: Des problèmes mineurs détectés');
      process.exit(0);
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { scanFile, scanDirectory };
