-- ==========================================
-- SCHÉMA RH - Tables pour module Ressources Humaines
-- ==========================================

BEGIN;

-- EMPLOYÉS
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    user_id UUID REFERENCES users(id),
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    date_of_birth DATE,
    hire_date DATE NOT NULL,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    base_salary DECIMAL(15,2) NOT NULL,
    contract_type VARCHAR(50) DEFAULT 'CDI',
    status VARCHAR(20) DEFAULT 'active',
    bank_account VARCHAR(50),
    address TEXT,
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- BULLETINS DE PAIE
CREATE TABLE IF NOT EXISTS payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    employee_id UUID REFERENCES employees(id),
    period VARCHAR(7) NOT NULL,
    employee_number VARCHAR(50),
    employee_name VARCHAR(255),
    position VARCHAR(100),
    department VARCHAR(100),
    base_salary DECIMAL(15,2) NOT NULL,
    worked_days INTEGER NOT NULL,
    bonuses DECIMAL(15,2) DEFAULT 0,
    allowances DECIMAL(15,2) DEFAULT 0,
    gross_salary DECIMAL(15,2) NOT NULL,
    social_charges DECIMAL(15,2) DEFAULT 0,
    tax DECIMAL(15,2) DEFAULT 0,
    deductions DECIMAL(15,2) DEFAULT 0,
    net_salary DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    generated_at TIMESTAMP,
    approved_at TIMESTAMP,
    paid_at TIMESTAMP,
    pdf_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, employee_id, period)
);

-- CONGÉS
CREATE TABLE IF NOT EXISTS leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    employee_id UUID REFERENCES employees(id),
    employee_name VARCHAR(255),
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP,
    approved_by UUID,
    rejected_at TIMESTAMP,
    rejected_by UUID,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- SOLDES DE CONGÉS
CREATE TABLE IF NOT EXISTS leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    employee_id UUID REFERENCES employees(id),
    year INTEGER NOT NULL,
    annual_leave_total INTEGER DEFAULT 30,
    annual_leave_taken INTEGER DEFAULT 0,
    annual_leave_remaining INTEGER DEFAULT 30,
    sick_leave_total INTEGER DEFAULT 15,
    sick_leave_taken INTEGER DEFAULT 0,
    sick_leave_remaining INTEGER DEFAULT 15,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, employee_id, year)
);

-- CRA (Compte Rendu d'Activité)
CREATE TABLE IF NOT EXISTS timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    employee_id UUID REFERENCES employees(id),
    employee_name VARCHAR(255),
    period VARCHAR(7) NOT NULL,
    week_number INTEGER,
    date DATE NOT NULL,
    project VARCHAR(255),
    task VARCHAR(255),
    hours DECIMAL(5,2) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ATTESTATIONS
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    employee_id UUID REFERENCES employees(id),
    employee_name VARCHAR(255),
    certificate_type VARCHAR(50) NOT NULL,
    certificate_number VARCHAR(50) UNIQUE,
    issue_date DATE NOT NULL,
    purpose TEXT,
    status VARCHAR(20) DEFAULT 'issued',
    pdf_url VARCHAR(500),
    requested_by UUID,
    issued_by UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- NOTES DE FRAIS
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    employee_id UUID REFERENCES employees(id),
    employee_name VARCHAR(255),
    expense_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF',
    description TEXT,
    receipt_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP,
    approved_by UUID,
    rejected_at TIMESTAMP,
    rejected_by UUID,
    rejection_reason TEXT,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PRÉSENCES
CREATE TABLE IF NOT EXISTS attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    employee_id UUID REFERENCES employees(id),
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    hours_worked DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'present',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, employee_id, date)
);

-- INDEX
CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_payslips_employee ON payslips(employee_id, period);
CREATE INDEX IF NOT EXISTS idx_leaves_employee ON leaves(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_timesheets_employee ON timesheets(employee_id, period);
CREATE INDEX IF NOT EXISTS idx_certificates_employee ON certificates(employee_id);
CREATE INDEX IF NOT EXISTS idx_expenses_employee ON expenses(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_attendances_employee ON attendances(employee_id, date);

COMMIT;
