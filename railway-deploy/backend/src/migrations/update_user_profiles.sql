-- Migration pour mettre à jour les utilisateurs existants vers le nouveau système de profils
-- Cette migration doit être exécutée une seule fois

-- Mettre à jour les utilisateurs qui n'ont pas de profiles
UPDATE users 
SET profiles = ARRAY[COALESCE(profile, 'entrepreneur')]
WHERE profiles IS NULL;

-- Mettre à jour les utilisateurs qui n'ont pas de primaryProfile
UPDATE users 
SET primary_profile = COALESCE(profile, 'entrepreneur')
WHERE primary_profile IS NULL;

-- S'assurer que tous les utilisateurs ont au moins un profil
UPDATE users 
SET profiles = ARRAY['entrepreneur']
WHERE profiles IS NULL OR profiles = '{}';

-- S'assurer que tous les utilisateurs ont un profil principal
UPDATE users 
SET primary_profile = 'entrepreneur'
WHERE primary_profile IS NULL;
