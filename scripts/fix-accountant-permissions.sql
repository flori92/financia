-- Script SQL pour vérifier et corriger les permissions de l'expert-comptable
-- À exécuter sur la base de données Railway

-- ============================================
-- 1. VÉRIFICATION DE L'ÉTAT ACTUEL
-- ============================================

-- Vérifier que le rôle accountant existe
SELECT 
    'Rôle Accountant' as check_type,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ Manquant' END as status,
    COUNT(*) as count
FROM roles 
WHERE name = 'accountant' AND is_system_role = true;

-- Vérifier que l'utilisateur comptable existe
SELECT 
    'Utilisateur Comptable' as check_type,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ Manquant' END as status,
    COUNT(*) as count
FROM users 
WHERE email = 'comptable@cabinet.bj';

-- Vérifier l'assignation du rôle
SELECT 
    'Assignation Rôle' as check_type,
    CASE WHEN COUNT(*) > 0 THEN '✅ Assigné' ELSE '❌ Non assigné' END as status,
    COUNT(*) as count
FROM user_roles ur
JOIN users u ON ur.user_id = u.id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'comptable@cabinet.bj' 
  AND r.name = 'accountant';

-- Vérifier les permissions du rôle accountant
SELECT 
    'Permissions Accountant' as check_type,
    CASE WHEN COUNT(*) > 0 THEN CONCAT('✅ ', COUNT(*), ' permissions') ELSE '❌ Aucune' END as status,
    COUNT(*) as count
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
WHERE r.name = 'accountant' AND r.is_system_role = true;

-- Détail des permissions bancaires
SELECT 
    p.resource,
    p.action,
    p.description
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'accountant' 
  AND r.is_system_role = true
  AND p.resource IN ('bank-accounts', 'treasury', 'tax')
ORDER BY p.resource, p.action;

-- ============================================
-- 2. CORRECTION SI NÉCESSAIRE
-- ============================================

-- Si le rôle n'est pas assigné, l'assigner
DO $$
DECLARE
    v_user_id UUID;
    v_role_id UUID;
BEGIN
    -- Récupérer l'ID de l'utilisateur
    SELECT id INTO v_user_id 
    FROM users 
    WHERE email = 'comptable@cabinet.bj';
    
    -- Récupérer l'ID du rôle
    SELECT id INTO v_role_id 
    FROM roles 
    WHERE name = 'accountant' AND is_system_role = true;
    
    -- Assigner le rôle si les deux existent
    IF v_user_id IS NOT NULL AND v_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id)
        VALUES (v_user_id, v_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
        
        RAISE NOTICE '✅ Rôle accountant assigné à comptable@cabinet.bj';
    ELSE
        IF v_user_id IS NULL THEN
            RAISE NOTICE '❌ Utilisateur comptable@cabinet.bj non trouvé';
        END IF;
        IF v_role_id IS NULL THEN
            RAISE NOTICE '❌ Rôle accountant non trouvé - Exécuter le seed';
        END IF;
    END IF;
END $$;

-- ============================================
-- 3. VÉRIFICATION FINALE
-- ============================================

-- Afficher l'état final
SELECT 
    u.email,
    u.role as system_role,
    r.name as rbac_role,
    r.description,
    COUNT(p.id) as permissions_count
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'comptable@cabinet.bj'
GROUP BY u.email, u.role, r.name, r.description;

-- Lister toutes les permissions de l'utilisateur
SELECT 
    u.email,
    p.resource,
    p.action,
    p.description
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'comptable@cabinet.bj'
ORDER BY p.resource, p.action;

-- ============================================
-- 4. INSTRUCTIONS
-- ============================================

/*
COMMENT UTILISER CE SCRIPT:

1. Se connecter à Railway:
   railway link

2. Ouvrir la console PostgreSQL:
   railway connect

3. Copier-coller ce script

4. Vérifier les résultats:
   - Si "Rôle Accountant" = ❌ Manquant → Exécuter: npm run seed
   - Si "Assignation Rôle" = ❌ Non assigné → Le script l'a corrigé automatiquement
   - Si "Permissions Accountant" = ❌ Aucune → Exécuter: npm run seed

5. Après correction:
   - Déconnectez-vous de l'application web
   - Reconnectez-vous avec comptable@cabinet.bj / password123
   - Testez l'accès au rapprochement bancaire

PERMISSIONS ATTENDUES POUR ACCOUNTANT:
- bank-accounts:create, read, update, delete, reconcile
- treasury:read, forecast
- tax:read, declare, calculate
- invoices:* (toutes)
- payments:* (toutes)
- accounts:* (toutes)
- journal-entries:* (toutes)
- reports:* (toutes)
*/
