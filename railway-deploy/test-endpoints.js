const axios = require('axios');

const API_BASE = 'https://bms-production-d9e9.up.railway.app/api/v1';
const COMPANY_ID = '1805bc61-7cfd-44e9-8a63-17187bf05dc7';

async function testEndpoints() {
  console.log('Test des endpoints BMS Accounting...\n');

  try {
    // 1. Test endpoint balance âgée
    console.log('1. Test /accounting/aged-balance');
    const agedBalanceResponse = await axios.get(`${API_BASE}/accounting/aged-balance?companyId=${COMPANY_ID}&type=receivables&asOfDate=2025-11-29`);
    console.log('aged-balance:', agedBalanceResponse.status, agedBalanceResponse.data);
  } catch (error) {
    console.log('aged-balance:', error.response?.status, error.response?.data);
  }

  try {
    // 2. Test seed SYSCOHADA
    console.log('\n2. Test /accounting/seed-syscohada');
    const seedResponse = await axios.post(`${API_BASE}/accounting/seed-syscohada?companyId=${COMPANY_ID}`);
    console.log('seed-syscohada:', seedResponse.status, seedResponse.data);
  } catch (error) {
    console.log('seed-syscohada:', error.response?.status, error.response?.data);
  }

  try {
    // 3. Test init demo data
    console.log('\n3. Test /accounting/init-demo-data');
    const demoResponse = await axios.post(`${API_BASE}/accounting/init-demo-data`);
    console.log('init-demo-data:', demoResponse.status, demoResponse.data);
  } catch (error) {
    console.log('init-demo-data:', error.response?.status, error.response?.data);
  }

  try {
    // 4. Test trial balance
    console.log('\n4. Test /accounting/trial-balance');
    const trialResponse = await axios.get(`${API_BASE}/accounting/trial-balance?companyId=${COMPANY_ID}`);
    console.log('trial-balance:', trialResponse.status, trialResponse.data);
  } catch (error) {
    console.log('trial-balance:', error.response?.status, error.response?.data);
  }

  try {
    // 5. Test accounts list
    console.log('\n5. Test /accounting/accounts');
    const accountsResponse = await axios.get(`${API_BASE}/accounting/accounts?companyId=${COMPANY_ID}`);
    console.log('accounts:', accountsResponse.status, accountsResponse.data);
  } catch (error) {
    console.log('accounts:', error.response?.status, error.response?.data);
  }
}

testEndpoints().catch(console.error);
