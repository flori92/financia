const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock auth
app.post('/api/v1/auth/login', (req, res) => {
  res.json({ access_token: 'mock-token-123', user: { email: req.body.email } });
});

app.post('/api/v1/auth/register', (req, res) => {
  res.json({ message: 'User registered', user: { email: req.body.email } });
});

// Mock companies
app.get('/api/v1/companies', (req, res) => {
  res.json([{ id: 'company-1', name: 'SARL DEMO BMS', nif: 'BJ123456789' }]);
});

// Mock invoices
app.get('/api/v1/invoices', (req, res) => {
  res.json([
    { id: '1', invoiceNumber: 'INV-001', totalAmount: 50000, status: 'paid', partyName: 'Client 1' },
    { id: '2', invoiceNumber: 'INV-002', totalAmount: 75000, status: 'unpaid', partyName: 'Client 2' }
  ]);
});

// Mock payments
app.get('/api/v1/payments', (req, res) => {
  res.json([
    { id: '1', amount: 50000, paymentDate: '2024-01-15', partyType: 'customer', paymentMethod: 'mobile_money' },
    { id: '2', amount: 30000, paymentDate: '2024-01-20', partyType: 'supplier', paymentMethod: 'cash' }
  ]);
});

// Mock accounting dashboard
app.get('/api/v1/accounting/dashboard/metrics', (req, res) => {
  res.json({
    totalRevenue: 500000,
    totalExpenses: 300000,
    netProfit: 200000,
    cashBalance: 150000,
    accountsReceivable: 100000,
    accountsPayable: 50000
  });
});

// Mock CRM contacts
app.get('/api/v1/crm/contacts', (req, res) => {
  res.json([
    { id: '1', firstName: 'Jean', lastName: 'Dupont', email: 'jean@example.com', type: 'customer' },
    { id: '2', firstName: 'Marie', lastName: 'Martin', email: 'marie@example.com', type: 'customer' }
  ]);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'BMS API Mock Server' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n✅ BMS Mock API Server running on http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health\n`);
});
