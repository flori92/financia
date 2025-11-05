# Plan de Correction des Boutons Non Fonctionnels

## Boutons Identifiés à Corriger

### 1. Plan Comptable - Import CSV ❌
**Fichier**: `bms-web/src/app/accountant/chart-of-accounts/page.tsx`
**Ligne**: 63
**Problème**: Affiche juste "Import CSV/Excel disponible prochainement"
**Solution**: Implémenter l'upload et l'import CSV
**API Backend**: Vérifier si endpoint existe

### 2. Grand Livre - Export PDF/Excel ❌
**Fichier**: `bms-web/src/app/accountant/general-ledger/page.tsx`
**Ligne**: 26
**Problème**: Affiche juste "Export PDF/Excel disponible prochainement"
**Solution**: Implémenter l'export via API
**API Backend**: `/api/v1/accounting/export/journal-entries`

### 3. TVA - Recalcul ⚠️
**Fichier**: `bms-web/src/app/accountant/tax/vat/page.tsx`
**Ligne**: 30
**Problème**: Utilise "default-company" en dur
**Solution**: Récupérer companyId depuis localStorage/context

## Ordre de Priorité

1. **Haute Priorité** 🔴
   - Grand Livre Export (utilisé fréquemment)
   - Plan Comptable Import (fonctionnalité importante)

2. **Moyenne Priorité** 🟡
   - TVA Recalcul (fix simple)

3. **Basse Priorité** 🟢
   - Autres boutons cosmétiques
