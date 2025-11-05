/**
 * Centralized API Client for BMS Frontend
 * Handles all HTTP requests to the backend API
 */

interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout || 30000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else if (contentType?.includes('text/')) {
        return await response.text() as T;
      } else {
        return await response.blob() as T;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      console.error(`API Request failed: ${url}`, error);
      throw error;
    }
  }

  // HTTP Methods
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    return this.request<T>(url, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload
  async upload<T = any>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // Download file
  async download(endpoint: string, filename?: string): Promise<void> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: this.defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Remove authentication token
  removeAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  // Update base URL (useful for environment switching)
  setBaseURL(baseURL: string) {
    this.baseURL = baseURL.replace(/\/$/, '');
  }
}

// Create and export the API client instance
const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 30000,
});

export default apiClient;

// Export specific API modules for better organization
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/api/v1/auth/login', credentials),
  
  register: (userData: any) =>
    apiClient.post('/api/v1/auth/register', userData),
  
  refresh: () =>
    apiClient.post('/api/v1/auth/refresh'),
  
  logout: () =>
    apiClient.post('/api/v1/auth/logout'),
};

export const communicationsAPI = {
  // Emails
  getEmails: (folder?: string) =>
    apiClient.get('/api/v1/communications/emails', { folder }),
  
  sendEmail: (emailData: any) =>
    apiClient.post('/api/v1/communications/emails', emailData),
  
  getEmail: (id: string) =>
    apiClient.get(`/api/v1/communications/emails/${id}`),

  // SMS
  getSMS: () =>
    apiClient.get('/api/v1/communications/sms'),
  
  sendSMS: (smsData: any) =>
    apiClient.post('/api/v1/communications/sms', smsData),

  // WhatsApp
  getWhatsApp: () =>
    apiClient.get('/api/v1/communications/whatsapp'),
  
  sendWhatsApp: (whatsAppData: any) =>
    apiClient.post('/api/v1/communications/whatsapp', whatsAppData),

  // Templates
  getTemplates: (type?: string) =>
    apiClient.get('/api/v1/communications/templates', { type }),
  
  createTemplate: (templateData: any) =>
    apiClient.post('/api/v1/communications/templates', templateData),
  
  getTemplate: (id: string) =>
    apiClient.get(`/api/v1/communications/templates/${id}`),
};

export const invoicesAPI = {
  getInvoices: () =>
    apiClient.get('/api/v1/invoices'),
  
  createInvoice: (invoiceData: any) =>
    apiClient.post('/api/v1/invoices', invoiceData),
  
  sendInvoice: (id: string) =>
    apiClient.post(`/api/v1/invoices/${id}/send`),
  
  getInvoice: (id: string) =>
    apiClient.get(`/api/v1/invoices/${id}`),
};

export const crmAPI = {
  getContacts: () =>
    apiClient.get('/api/v1/crm/contacts'),
  
  createContact: (contactData: any) =>
    apiClient.post('/api/v1/crm/contacts', contactData),
  
  getContact: (id: string) =>
    apiClient.get(`/api/v1/crm/contacts/${id}`),
  
  getStats: () =>
    apiClient.get('/api/v1/crm/stats'),
};

export const budgetAPI = {
  createRevision: (revisionData: any) =>
    apiClient.post('/api/v1/budget/revisions', revisionData),
  
  createBudget: (budgetData: any) =>
    apiClient.post('/api/v1/budget/new', budgetData),
};

export const treasuryAPI = {
  getDirectDebits: (companyId: string) =>
    apiClient.get('/api/v1/treasury/direct-debits', { companyId }),
  
  getDirectDebitStats: (companyId: string) =>
    apiClient.get('/api/v1/treasury/direct-debits/statistics', { companyId }),
  
  createDirectDebit: (debitData: any) =>
    apiClient.post('/api/v1/treasury/direct-debits', debitData),
  
  updateDirectDebit: (id: string, debitData: any) =>
    apiClient.put(`/api/v1/treasury/direct-debits/${id}`, debitData),
  
  deleteDirectDebit: (id: string) =>
    apiClient.delete(`/api/v1/treasury/direct-debits/${id}`),
  
  executeDirectDebitAction: (id: string, action: string) =>
    apiClient.post(`/api/v1/treasury/direct-debits/${id}/${action}`),
};

export const accountingAPI = {
  exportChartOfAccounts: (companyId: string) =>
    apiClient.download(`/api/v1/accounting/export/chart-of-accounts?companyId=${companyId}`, 'chart-of-accounts.xlsx'),
  
  exportTrialBalance: (companyId: string) =>
    apiClient.download(`/api/v1/accounting/export/trial-balance?companyId=${companyId}`, 'trial-balance.xlsx'),
  
  exportJournalEntries: (companyId: string) =>
    apiClient.download(`/api/v1/accounting/export/journal-entries?companyId=${companyId}`, 'journal-entries.xlsx'),
  
  createJournalEntry: (entryData: any) =>
    apiClient.post('/api/v1/accounting/journal-entries', entryData),
};

export const bankingAPI = {
  getTransactions: (companyId: string) =>
    apiClient.get('/api/v1/banking/transactions', { companyId }),
  
  autoMatch: (companyId: string) =>
    apiClient.post('/api/v1/banking/auto-match', { companyId }),
  
  getSuggestions: (transactionId: string, companyId: string) =>
    apiClient.get(`/api/v1/banking/transactions/${transactionId}/entry-suggest`, { companyId }),
  
  reconcileEntry: (reconciliationData: any) =>
    apiClient.post('/api/v1/banking/reconcile-entry', reconciliationData),
};

export const taxAPI = {
  recalculateVAT: (companyId: string) =>
    apiClient.post('/api/v1/tax/vat/recalculate', { companyId }),
  
  exportFEC: (companyId: string) =>
    apiClient.download(`/api/v1/tax/export/fec?companyId=${companyId}`, 'fec-export.txt'),
  
  generateCA3PDF: (companyId: string) =>
    apiClient.download(`/api/v1/tax/generate-ca3-pdf?companyId=${companyId}`, 'ca3-declaration.pdf'),
};

export const aiAPI = {
  chat: (message: string, context?: any) =>
    apiClient.post('/api/v1/ai/chat', { message, context }),
  
  ocr: (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload(`/api/v1/ai/ocr/${type}`, formData);
  },
};

export const uploadsAPI = {
  upload: (file: File, entityType?: string, entityId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const params = new URLSearchParams();
    if (entityType) params.append('entityType', entityType);
    if (entityId) params.append('entityId', entityId);
    
    return apiClient.upload(`/api/v1/uploads?${params.toString()}`, formData);
  },
};

export const companiesAPI = {
  getCompanies: () =>
    apiClient.get('/api/v1/companies'),
  
  createCompany: (companyData: any) =>
    apiClient.post('/api/v1/companies', companyData),
};

export const supportAPI = {
  getTickets: () =>
    apiClient.get('/api/v1/support/tickets'),
};

export const marketingAPI = {
  getCampaigns: () =>
    apiClient.get('/api/v1/marketing/campaigns'),
};