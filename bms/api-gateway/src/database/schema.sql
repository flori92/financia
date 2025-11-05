-- ==================== CORE TABLES ====================

-- Companies (Multi-tenant)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_form VARCHAR(50),
    nif VARCHAR(50) UNIQUE,
    address TEXT,
    country VARCHAR(2) DEFAULT 'BJ',
    currency VARCHAR(3) DEFAULT 'XOF',
    fiscal_year_end DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==================== ACCOUNTING ====================

-- Chart of Accounts (Plan comptable)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    account_number VARCHAR(20) NOT NULL,
    label VARCHAR(255) NOT NULL,
    account_type VARCHAR(50), -- asset, liability, equity, revenue, expense
    syscohada_class INTEGER,
    parent_account_id UUID REFERENCES accounts(id),
    is_auxiliary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, account_number)
);

-- Analytical Axes (Axes analytiques)
CREATE TABLE analytical_axes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    UNIQUE(company_id, code)
);

-- Analytical Sections
CREATE TABLE analytical_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    axis_id UUID REFERENCES analytical_axes(id),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    UNIQUE(axis_id, code)
);

-- Journal Entries (Écritures comptables)
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    entry_date DATE NOT NULL,
    reference VARCHAR(50),
    description TEXT,
    journal_code VARCHAR(10),
    status VARCHAR(20) DEFAULT 'draft', -- draft, posted, cancelled
    posted_at TIMESTAMP,
    posted_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    INDEX idx_entry_date (entry_date),
    INDEX idx_company_status (company_id, status)
);

-- Journal Entry Lines
CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id),
    debit DECIMAL(15,2) DEFAULT 0,
    credit DECIMAL(15,2) DEFAULT 0,
    label TEXT,
    analytical_section_id UUID REFERENCES analytical_sections(id),
    reconciliation_key VARCHAR(50),
    reconciled_at TIMESTAMP,
    INDEX idx_account (account_id),
    INDEX idx_reconciliation (reconciliation_key)
);

-- ==================== TREASURY ====================

-- Bank Accounts
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    iban VARCHAR(34),
    bic VARCHAR(11),
    currency VARCHAR(3) DEFAULT 'XOF',
    balance DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bank Transactions
CREATE TABLE bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_account_id UUID REFERENCES bank_accounts(id),
    transaction_date DATE NOT NULL,
    value_date DATE,
    amount DECIMAL(15,2) NOT NULL,
    label TEXT,
    reference VARCHAR(100),
    counterparty_name VARCHAR(255),
    counterparty_iban VARCHAR(34),
    is_reconciled BOOLEAN DEFAULT FALSE,
    reconciled_entry_id UUID REFERENCES journal_entries(id),
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_bank_date (bank_account_id, transaction_date),
    INDEX idx_reconciled (is_reconciled)
);

-- Cash Flow Forecast
CREATE TABLE cash_flow_forecast (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    forecast_date DATE NOT NULL,
    type VARCHAR(20), -- inflow, outflow
    category VARCHAR(50),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    is_realized BOOLEAN DEFAULT FALSE,
    UNIQUE(company_id, forecast_date, type, category)
);

-- ==================== INVOICING ====================

-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    nif VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    payment_terms INTEGER DEFAULT 30,
    credit_limit DECIMAL(15,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    nif VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    payment_terms INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    customer_id UUID REFERENCES customers(id),
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'draft', -- draft, sent, paid, cancelled
    subtotal DECIMAL(15,2) NOT NULL,
    vat_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'XOF',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, invoice_number),
    INDEX idx_customer_status (customer_id, status)
);

-- Invoice Lines
CREATE TABLE invoice_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    vat_rate DECIMAL(5,2) DEFAULT 0,
    amount DECIMAL(15,2) NOT NULL
);

-- ==================== INVENTORY ====================

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit_price DECIMAL(15,2),
    cost_price DECIMAL(15,2),
    stock_quantity DECIMAL(10,2) DEFAULT 0,
    min_stock DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, sku)
);

-- Stock Movements
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    movement_date DATE NOT NULL,
    type VARCHAR(20), -- in, out, adjustment
    quantity DECIMAL(10,2) NOT NULL,
    reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_product_date (product_id, movement_date)
);

-- ==================== PURCHASES ====================

-- Purchase Orders
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    supplier_id UUID REFERENCES suppliers(id),
    order_number VARCHAR(50) NOT NULL,
    order_date DATE NOT NULL,
    expected_date DATE,
    status VARCHAR(20) DEFAULT 'draft', -- draft, sent, received, cancelled
    total_amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, order_number)
);

-- ==================== BUDGETS ====================

-- Budgets
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    account_id UUID REFERENCES accounts(id),
    fiscal_year INTEGER NOT NULL,
    period VARCHAR(10), -- month or quarter
    amount DECIMAL(15,2) NOT NULL,
    analytical_section_id UUID REFERENCES analytical_sections(id),
    UNIQUE(company_id, account_id, fiscal_year, period)
);

-- ==================== TAX ====================

-- VAT Declarations
CREATE TABLE vat_declarations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    vat_collected DECIMAL(15,2) DEFAULT 0,
    vat_deductible DECIMAL(15,2) DEFAULT 0,
    vat_due DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft', -- draft, submitted, paid
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==================== AUDIT ====================

-- Audit Log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    user_id UUID,
    entity_type VARCHAR(50),
    entity_id UUID,
    action VARCHAR(20), -- create, update, delete
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
);

-- ==================== INDEXES & CONSTRAINTS ====================

CREATE INDEX idx_accounts_company ON accounts(company_id);
CREATE INDEX idx_journal_entries_company ON journal_entries(company_id);
CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_customers_company ON customers(company_id);
CREATE INDEX idx_suppliers_company ON suppliers(company_id);
CREATE INDEX idx_products_company ON products(company_id);


-- ==================== COMMUNICATIONS ====================

-- Emails
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    "from" VARCHAR(255) NOT NULL,
    "to" VARCHAR(255) NOT NULL,
    cc VARCHAR(255),
    bcc VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    folder VARCHAR(50) DEFAULT 'inbox',
    status VARCHAR(50) DEFAULT 'draft',
    read BOOLEAN DEFAULT FALSE,
    starred BOOLEAN DEFAULT FALSE,
    has_attachment BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emails_company_folder ON emails(company_id, folder);
CREATE INDEX IF NOT EXISTS idx_emails_company_created ON emails(company_id, created_at);

-- SMS Messages
CREATE TABLE IF NOT EXISTS sms_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    "to" VARCHAR(50) NOT NULL,
    "from" VARCHAR(50),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    provider_id VARCHAR(100),
    provider_name VARCHAR(50),
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    error_message TEXT,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_company_created ON sms_messages(company_id, created_at);

-- WhatsApp Messages
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    conversation_id VARCHAR(100) NOT NULL,
    "to" VARCHAR(50) NOT NULL,
    "from" VARCHAR(50),
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'text',
    direction VARCHAR(50) DEFAULT 'outbound',
    status VARCHAR(50) DEFAULT 'pending',
    media_url VARCHAR(500),
    provider_id VARCHAR(100),
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    error_message TEXT,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_company_conversation ON whatsapp_messages(company_id, conversation_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_company_created ON whatsapp_messages(company_id, created_at);

-- Communication Templates
CREATE TABLE IF NOT EXISTS communication_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    subject VARCHAR(500),
    body TEXT NOT NULL,
    variables JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_company_type ON communication_templates(company_id, type);
