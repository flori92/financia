-- Créer un utilisateur par défaut pour tester le login
-- Email: admin@bms.com / Mot de passe: admin123

INSERT INTO users (id, email, "firstName", "lastName", password, "isActive", "role", "createdAt", "updatedAt")
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'admin@bms.com',
    'Admin',
    'BMS',
    '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', -- hash de 'admin123'
    true,
    'admin',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;
