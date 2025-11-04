-- Migration: Ajout des colonnes profiles et primary_profile à la table users
-- Date: 2025-11-04
-- Description: Migration pour supporter les profils multiples utilisateur

-- Étape 1: Ajouter les nouvelles colonnes si elles n'existent pas
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profiles TEXT,
ADD COLUMN IF NOT EXISTS primary_profile VARCHAR(50) DEFAULT 'entrepreneur';

-- Étape 2: Migrer les données existantes de profile vers profiles et primary_profile
UPDATE users 
SET 
  profiles = COALESCE(profile, 'entrepreneur'),
  primary_profile = COALESCE(profile, 'entrepreneur')
WHERE profiles IS NULL OR primary_profile IS NULL;

-- Étape 3: Rendre la colonne profile nullable (pour compatibilité temporaire)
ALTER TABLE users 
ALTER COLUMN profile DROP NOT NULL;

-- Étape 4: Créer un index sur primary_profile pour les performances
CREATE INDEX IF NOT EXISTS idx_users_primary_profile ON users(primary_profile);

-- Vérification finale
SELECT 
  COUNT(*) as total_users,
  COUNT(profiles) as users_with_profiles,
  COUNT(primary_profile) as users_with_primary_profile
FROM users;
