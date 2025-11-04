-- Création de la table direct_debits
CREATE TABLE IF NOT EXISTS direct_debits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    mandate_reference VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    creditor VARCHAR(255) NOT NULL,
    debtor_iban VARCHAR(34),
    creditor_iban VARCHAR(34),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF',
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'yearly', 'one-time')),
    day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
    start_date DATE NOT NULL,
    end_date DATE,
    last_execution_date DATE,
    next_execution_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'completed')),
    category VARCHAR(100),
    notes TEXT,
    notification_days_before INTEGER DEFAULT 3,
    notification_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_direct_debits_company_id ON direct_debits(company_id);
CREATE INDEX idx_direct_debits_status ON direct_debits(status);
CREATE INDEX idx_direct_debits_next_execution ON direct_debits(next_execution_date);
CREATE INDEX idx_direct_debits_company_status ON direct_debits(company_id, status);

-- Commentaires
COMMENT ON TABLE direct_debits IS 'Prélèvements automatiques récurrents';
COMMENT ON COLUMN direct_debits.mandate_reference IS 'Référence unique du mandat de prélèvement';
COMMENT ON COLUMN direct_debits.frequency IS 'Fréquence: monthly, quarterly, yearly, one-time';
COMMENT ON COLUMN direct_debits.status IS 'Statut: active, suspended, cancelled, completed';
