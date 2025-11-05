#!/usr/bin/env node

/**
 * Script pour vérifier qu'il n'y a plus de mocks hardcodés dans le code
 */

const fs = require('fs');
const path = require('path');

const PATTERNS_TO_CHECK = [
  {
    pattern: /getMock[A-Z]\w+/g,
    description: 'Méthodes getMock*',
    severity: 'ERROR',
  },
  {
    pattern: /mockData\s*=\s*\[/g,
    description: 'Variables mockData',
    severity: 'ERROR',
  },
  {
    pattern: /\/\/\s*Mock data/gi,
    description: 'Commentaires "Mock data"',
    severity: 'WARNING',
  },
  {
    pattern: /return\s*\[\s*\{\s*id:\s*['"]1['"]/g,
    description: 'Return de tableaux hardcodés',
    severity: 'ERROR',
  },
  {
    pattern: /:\s*any(?!\w)/g,
    description: 'Type "any"',
    severity: 'WARNING',
  },
  {
    pattern: /localhost:3001/g,
    description: 'URLs hardcodées localhost:3001',
    severity: 'ERROR',
  },
];

const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
  'coverage',
  'scripts/verify-no-mocks.js', // Exclure ce script lui-même
  'scripts/fix-hardcoded-apis.js',
  '.md', // Exclure les fichiers markdown
  'README',
  'FINAL-STATUS',
  'corrections-summary',
];

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  PATTERNS_TO_CHECK.forEach(({ pattern, description, severity }) => {
    const matches = content.match(pattern);
    if (matches) {
      // Get line numbers
      const lines = content.split('\n');
      const lineNumbers = [];
      
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          lineNumbers.push(index + 1);
        }
      });

      issues.push({
        severity,
        description,
        count: matches.length,
        lineNumbers,
      });
    }
  });

  return issues;
}

function walkDirectory(dir, filePattern = /\.(ts|tsx|js|jsx)$/) {
  const results = {
    errors: [],
    warnings: [],
    filesChecked: 0,
  };

  function walk(currentPath) {
    const files = fs.readdirSync(currentPath);

    files.forEach(file => {
      const filePath = path.join(currentPath, file);
      
      if (shouldExclude(filePath)) {
        return;
      }

      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walk(filePath);
      } else if (filePattern.test(file)) {
        results.filesChecked++;
        const issues = checkFile(filePath);

        if (issues.length > 0) {
          issues.forEach(issue => {
            const entry = {
              file: filePath,
              ...issue,
            };

            if (issue.severity === 'ERROR') {
              results.errors.push(entry);
            } else {
              results.warnings.push(entry);
            }
          });
        }
      }
    });
  }

  walk(dir);
  return results;
}

// Main execution
console.log('🔍 Vérification des mocks et données hardcodées...\n');

const targetDirs = [
  path.join(__dirname, '..', 'bms', 'api-gateway', 'src'),
  path.join(__dirname, '..', 'bms-web', 'src'),
];

let totalErrors = 0;
let totalWarnings = 0;
let totalFilesChecked = 0;

targetDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directory not found: ${dir}\n`);
    return;
  }

  console.log(`📂 Checking: ${dir}\n`);
  const results = walkDirectory(dir);

  totalFilesChecked += results.filesChecked;
  totalErrors += results.errors.length;
  totalWarnings += results.warnings.length;

  // Display errors
  if (results.errors.length > 0) {
    console.log('❌ ERRORS FOUND:\n');
    results.errors.forEach(error => {
      console.log(`  File: ${error.file}`);
      console.log(`  Issue: ${error.description}`);
      console.log(`  Count: ${error.count}`);
      console.log(`  Lines: ${error.lineNumbers.join(', ')}`);
      console.log('');
    });
  }

  // Display warnings
  if (results.warnings.length > 0) {
    console.log('⚠️  WARNINGS FOUND:\n');
    results.warnings.forEach(warning => {
      console.log(`  File: ${warning.file}`);
      console.log(`  Issue: ${warning.description}`);
      console.log(`  Count: ${warning.count}`);
      console.log(`  Lines: ${warning.lineNumbers.join(', ')}`);
      console.log('');
    });
  }
});

// Summary
console.log('═══════════════════════════════════════════════════');
console.log('📊 SUMMARY');
console.log('═══════════════════════════════════════════════════');
console.log(`Files checked: ${totalFilesChecked}`);
console.log(`Errors: ${totalErrors}`);
console.log(`Warnings: ${totalWarnings}`);
console.log('═══════════════════════════════════════════════════\n');

if (totalErrors === 0 && totalWarnings === 0) {
  console.log('✅ SUCCESS! No mocks or hardcoded data found!\n');
  process.exit(0);
} else if (totalErrors === 0) {
  console.log('✅ No critical errors, but some warnings to review.\n');
  process.exit(0);
} else {
  console.log('❌ FAILED! Please fix the errors above.\n');
  process.exit(1);
}
