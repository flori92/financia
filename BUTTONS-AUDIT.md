# Audit des Boutons - BMS Web Application

## Objectif
Vérifier que tous les boutons d'action des pages principales fonctionnent correctement.

## Pages à Auditer

### 1. Pages Comptables (Accountant)
- [x] `/accountant/bank` - Rapprochement bancaire (Import/Export ajoutés)
- [ ] `/accountant/chart-of-accounts` - Plan comptable (Import/Export)
- [ ] `/accountant/general-ledger` - Grand livre (Export)
- [ ] `/accountant/journal` - Journal
- [ ] `/accountant/trial-balance` - Balance
- [ ] `/accountant/profit-loss` - Compte de résultat (Export)
- [ ] `/accountant/balance-sheet` - Bilan (Export)
- [ ] `/accountant/tax/vat` - TVA
- [ ] `/accountant/close` - Clôture

### 2. Pages Trésorerie (Treasury)
- [ ] `/treasury/operations` - Opérations (Import SEPA)
- [ ] `/treasury/direct-debits` - Prélèvements

### 3. Pages Dashboard
- [ ] `/dashboard` - Tableau de bord principal
- [ ] `/dashboard/bi` - Business Intelligence (Export)

### 4. Pages CRM
- [ ] `/crm/contacts` - Contacts
- [ ] `/crm/opportunities` - Opportunités

### 5. Pages Communications
- [ ] `/communications/emails` - Emails
- [ ] `/communications/sms` - SMS
- [ ] `/communications/whatsapp` - WhatsApp

## Statut des Corrections

### Complétées ✅
1. **Rapprochement bancaire** (`/accountant/bank`)
   - ✅ Bouton Import CSV fonctionnel
   - ✅ Bouton Export CSV fonctionnel
   - ✅ Gestion des permissions (403)
   - ✅ Messages d'erreur clairs

### En Cours 🔄

### À Faire 📋
