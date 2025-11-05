#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🧹 Suppression des mocks et connexion aux APIs réelles...\n');

const srcDir = path.join(__dirname, '../bms-web/src');
const files = glob.sync(`${srcDir}/**/*.{ts,tsx}`, {
  ignore: ['**/node_modules/**', '**/.next/**']
});

const replacements = [
  // Cash Flow Coherence
  {
    file: 'app/accountant/cash-flow-coherence/page.tsx',
    mock: /const mockCashFlowData[\s\S]*?setCashFlowData\(mockCashFlowData\);[\s\S]*?setMetrics\(mockMetrics\);[\s\S]*?setAlerts\(mockAlerts\);/,
    real: `const data = await apiGet('/api/v1/treasury/cash-flow-analysis', { companyId });
      setCashFlowData(data.cashFlow || []);
      setMetrics(data.metrics || {});
      setAlerts(data.alerts || []);`
  },
  
  // ML Forecast
  {
    file: 'app/accountant/ml-forecast/page.tsx',
    mock: /const mockData: MLForecastData[\s\S]*?setData\(mockData\);/,
    real: `const data = await apiGet('/api/v1/accounting/ml-forecast', { companyId });
      setData(data);`
  },
  
  // Revenue Recognition
  {
    file: 'app/accountant/revenue-recognition/page.tsx',
    mock: /const mockData: RevenueData\[\][\s\S]*?setRevenueData\(mockData\);/,
    real: `const data = await apiGet('/api/v1/accounting/revenue-recognition', { companyId });
      setRevenueData(data);`
  },
  
  // Multi-dimensional Analysis
  {
    file: 'app/accountant/multi-dimensional-analysis/page.tsx',
    mock: /const mockData: MultiDimensionalData[\s\S]*?setData\(mockData\);/,
    real: `const data = await apiGet('/api/v1/accounting/multi-dimensional-analysis', { companyId });
      setData(data);`
  },
  
  // Bank Partner
  {
    file: 'app/bank-partner/page.tsx',
    mock: /const mockData: BankPartnerData[\s\S]*?setData\(mockData\);/,
    real: `const data = await apiGet('/api/v1/banking/partner-dashboard', { companyId });
      setData(data);`
  },
  
  // Users Settings
  {
    file: 'app/settings/users/page.tsx',
    mock: /const MOCK_USERS[\s\S]*?\];[\s\S]*?const \[users, setUsers\] = useState\(MOCK_USERS\);/,
    real: `const [users, setUsers] = useState([]);
  
  useEffect(() => {
    apiGet('/api/v1/users').then(data => setUsers(data)).catch(console.error);
  }, []);`
  }
];

let fixedCount = 0;

replacements.forEach(({ file: relPath, mock, real }) => {
  const filePath = path.join(srcDir, relPath);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Fichier non trouvé: ${relPath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  content = content.replace(mock, real);
  
  // Ajouter l'import si nécessaire
  if (content !== original && !content.includes("from '@/lib/api'")) {
    const importStatement = "import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';\n";
    const lines = content.split('\n');
    let insertIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].includes('use client')) {
        insertIndex = i + 1;
      } else if (insertIndex > 0 && lines[i].trim() === '') {
        break;
      }
    }
    
    lines.splice(insertIndex, 0, importStatement);
    content = lines.join('\n');
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Mock supprimé: ${relPath}`);
    fixedCount++;
  }
});

console.log(`\n✨ ${fixedCount} mocks supprimés!`);
