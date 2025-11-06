-- Migration: ensure employees table exists
-- Created on 2025-11-06

BEGIN;

CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  position VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  base_salary NUMERIC(15,2) NOT NULL,
  hire_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_company_email ON employees(company_id, email);
CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id);

COMMIT;
