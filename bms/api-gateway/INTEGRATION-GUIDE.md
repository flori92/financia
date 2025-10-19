# Guide d'Intégration BMS ERP

## Services Implémentés

### 1. Rapprochement Bancaire Intelligent
**Service**: `BankReconciliationService`

**Fonctionnalités**:
- Matching automatique transactions bancaires ↔ écritures comptables
- Score de matching basé sur: montant, date (±3j), référence
- Matching flou pour les références
- Génération automatique d'écritures de rapprochement

**Utilisation**:
```typescript
const matches = await bankReconciliationService.autoMatch(
  bankTransactions,
  journalEntries
);

// Générer écriture pour transaction non rapprochée
const entry = bankReconciliationService.generateReconciliationEntry(
  bankTransaction,
  '512000' // Compte banque
);
```

### 2. Agrégation Bancaire (Budget Insight)
**Service**: `BudgetInsightService`

**Configuration**:
```env
BUDGET_INSIGHT_CLIENT_ID=your_client_id
BUDGET_INSIGHT_CLIENT_SECRET=your_secret
```

**Fonctionnalités**:
- Connexion automatique aux banques
- Récupération transactions temps réel
- Synchronisation quotidienne
- Support multi-banques

**Utilisation**:
```typescript
// Récupérer comptes
const accounts = await budgetInsightService.getAccounts(userId);

// Récupérer transactions
const transactions = await budgetInsightService.getTransactions(
  userId,
  accountId,
  new Date('2025-01-01')
);

// Synchroniser
await budgetInsightService.syncAccount(userId, connectionId);
```

### 3. Facturation Électronique Factur-X
**Service**: `FacturXService`

**Fonctionnalités**:
- Génération XML Factur-X (profil BASIC EN 16931)
- Métadonnées PDF/A-3
- Validation conformité
- Parsing XML

**Utilisation**:
```typescript
// Générer XML
const xml = facturXService.generateXML(invoice);

// Valider
const { valid, errors } = facturXService.validate(xml);

// Métadonnées PDF
const metadata = facturXService.generatePDFMetadata(invoice);
```

**Format Facture**:
```typescript
const invoice = {
  invoiceNumber: 'INV-2025-001',
  invoiceDate: new Date(),
  currency: 'XOF',
  subtotal: 100000,
  vatAmount: 18000,
  totalAmount: 118000,
  seller: {
    name: 'Ma Société',
    nif: '123456789',
    address: 'Cotonou, Bénin',
    country: 'BJ'
  },
  customer: {
    name: 'Client A',
    address: 'Abidjan, CI',
    country: 'CI'
  }
};
```

### 4. Chorus Pro (B2G)
**Service**: `ChorusProService`

**Configuration**:
```env
CHORUS_PRO_CLIENT_ID=your_client_id
CHORUS_PRO_CLIENT_SECRET=your_secret
```

**Fonctionnalités**:
- Soumission factures secteur public
- Suivi statuts (DEPOSITED, VALIDATED, REJECTED, PAID)
- Gestion rejets
- Validation SIRET

**Utilisation**:
```typescript
// Soumettre facture
const chorusId = await chorusProService.submitInvoice(invoice, facturxXml);

// Vérifier statut
const status = await chorusProService.getInvoiceStatus(chorusId);

// Valider SIRET
const isValid = await chorusProService.validateSiret('12345678901234');
```

### 5. Prévisionnel de Trésorerie
**Service**: `CashFlowForecastService`

**Fonctionnalités**:
- Prévisionnel jour par jour (90 jours par défaut)
- 3 scenarii: optimiste, réaliste, pessimiste
- Alertes automatiques (découvert, solde faible)
- Recommandations d'actions

**Utilisation**:
```typescript
// Générer prévisionnel
const forecast = await cashFlowForecastService.generateForecast(companyId, 90);

// Analyser scenarii
const scenarios = await cashFlowForecastService.analyzeScenarios(companyId);

// Obtenir recommandations
const recommendations = await cashFlowForecastService.getRecommendations(companyId);
```

**Format Prévisionnel**:
```typescript
{
  date: '2025-10-20',
  inflows: 1000000,    // Encaissements prévus
  outflows: 800000,    // Décaissements prévus
  netFlow: 200000,     // Flux net
  balance: 5200000,    // Solde prévisionnel
  status: 'healthy'    // healthy | warning | critical
}
```

## Workflow Complet

### Facturation B2B
1. Créer facture dans BMS
2. Générer XML Factur-X
3. Générer PDF/A-3 avec XML embarqué
4. Envoyer au client (email + portail)
5. Archiver 10 ans

### Facturation B2G (Secteur Public)
1. Créer facture dans BMS
2. Générer XML Factur-X
3. Soumettre à Chorus Pro
4. Suivre statut
5. Traiter rejets si nécessaire
6. Confirmer paiement

### Rapprochement Bancaire
1. Synchroniser transactions (Budget Insight)
2. Transformer format BMS
3. Matching automatique avec écritures
4. Valider matches (score > 0.7)
5. Générer écritures pour non-rapprochés
6. Lettrage automatique

### Prévisionnel Trésorerie
1. Récupérer factures clients à échéance
2. Récupérer factures fournisseurs à échéance
3. Ajouter charges fixes
4. Calculer flux jour par jour
5. Générer alertes
6. Proposer actions

## Installation Dépendances

```bash
npm install xmlbuilder2  # Pour Factur-X
npm install @nestjs/config  # Configuration
```

## Tests

```bash
# Tester rapprochement bancaire
npm run test bank-reconciliation.service

# Tester Factur-X
npm run test facturx.service

# Tester prévisionnel
npm run test cash-flow-forecast.service
```

## Production

### Sécurité
- Stocker credentials dans variables d'environnement
- Utiliser HTTPS uniquement
- Chiffrer données sensibles
- Logs d'audit complets

### Performance
- Cache Redis pour transactions fréquentes
- Queue pour traitements longs (sync bancaire)
- Pagination pour gros volumes

### Monitoring
- Alertes sur échecs d'intégration
- Métriques: taux de matching, temps de réponse
- Logs centralisés (ELK)

## Support

- Budget Insight: https://docs.budget-insight.com
- Factur-X: https://fnfe-mpe.org/factur-x/
- Chorus Pro: https://chorus-pro.gouv.fr/documentation
