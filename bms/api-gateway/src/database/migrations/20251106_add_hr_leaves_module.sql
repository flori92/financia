-- Migration: add HR leave management tables
-- Created on 2025-11-06

BEGIN;

-- Leave type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hr_leave_type_enum') THEN
    CREATE TYPE hr_leave_type_enum AS ENUM (
      'annual',
      'sick',
      'unpaid',
      'maternity',
      'paternity',
      'other'
    );
  END IF;
END $$;

-- Leave status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hr_leave_status_enum') THEN
    CREATE TYPE hr_leave_status_enum AS ENUM (
      'draft',
      'pending',
      'approved',
      'rejected',
      'cancelled'
    );
  END IF;
END $$;

-- Leave approval status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hr_leave_approval_status_enum') THEN
    CREATE TYPE hr_leave_approval_status_enum AS ENUM (
      'pending',
      'approved',
      'rejected',
      'skipped'
    );
  END IF;
END $$;

-- Leaves table
CREATE TABLE IF NOT EXISTS leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  type hr_leave_type_enum NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INTEGER NOT NULL,
  reason TEXT,
  status hr_leave_status_enum NOT NULL DEFAULT 'draft',
  current_step INTEGER NOT NULL DEFAULT 0,
  approver_id UUID,
  current_approver_id UUID,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  decided_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaves_company ON leaves(company_id);
CREATE INDEX IF NOT EXISTS idx_leaves_employee ON leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);

-- Leave balances table
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  year INTEGER NOT NULL,
  annual_leave_total NUMERIC(10,2) NOT NULL DEFAULT 30,
  annual_leave_taken NUMERIC(10,2) NOT NULL DEFAULT 0,
  annual_leave_remaining NUMERIC(10,2) NOT NULL DEFAULT 30,
  sick_leave_total NUMERIC(10,2) NOT NULL DEFAULT 15,
  sick_leave_taken NUMERIC(10,2) NOT NULL DEFAULT 0,
  sick_leave_remaining NUMERIC(10,2) NOT NULL DEFAULT 15,
  last_accrual_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_leave_balances UNIQUE (company_id, employee_id, year)
);

CREATE INDEX IF NOT EXISTS idx_leave_balances_company ON leave_balances(company_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee ON leave_balances(employee_id);

-- Leave approvals table
CREATE TABLE IF NOT EXISTS leave_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_id UUID NOT NULL REFERENCES leaves(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  role VARCHAR(100) NOT NULL,
  approver_id UUID,
  status hr_leave_approval_status_enum NOT NULL DEFAULT 'pending',
  decided_at TIMESTAMPTZ,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leave_approvals_leave ON leave_approvals(leave_id);
CREATE INDEX IF NOT EXISTS idx_leave_approvals_status ON leave_approvals(status);

COMMIT;
