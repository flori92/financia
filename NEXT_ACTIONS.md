# ✅ BMS – Plan d’Action Opérationnel

Document de suivi unique couvrant la feuille de route produit et technique.

---

## Lot 0 – Préparation Immédiate

- **[backlog]** Finaliser la cartographie des lots 1→4 et ouvrir les issues associées.
- **[seeds]** Étendre les données de démo (entrepreneurs, comptables, formalisation, paiements) pour supporter les écrans.
- **[outillage]** Mettre en place le tableau de suivi (issues/labels) et checklist de validation par persona.
- **[docs]** Synchroniser `BMS_CAHIER_DES_CHARGES.md` et ce fichier à chaque livraison.

---

## Lot 1 – Parcours Entrepreneur (MVP)

- **Dashboard (`src/app/page.tsx`)**
  - [ ] KPIs temps réel: trésorerie, revenus, factures impayées, progression formalisation.
  - [ ] Alertes & gamification (badges, notifications critiques).
- **Transactions (`src/app/transactions/page.tsx`)**
  - [ ] CRUD complet + import mobile money (mock) + filtrage.
  - [ ] Export CSV/PDF.
- **Facturation (`src/app/invoices/page.tsx`)**
  - [ ] Actions Submit/Cancel/Send (WhatsApp/SMS/Email).
  - [ ] Upload pièces + archivage légal (backend `invoices.service.ts`).
- **Trésorerie (`src/app/treasury/page.tsx`)**
  - [ ] Flux de trésorerie (cashflow) via `accounting.service.ts`.
  - [ ] Prévision 7/30 jours + recommandations.
- **Formalisation / NIF**
  - [ ] Checklist documents, suivi statut (`nif.controller.ts`).
- **Tech**
  - [ ] Tests unitaires services (Nest) et composants clés (React).
  - [ ] Gestion state front (loading, erreurs, retries).

---

## Lot 2 – Parcours Expert-Comptable

- **Dashboard multi-clients** avec filtres (statut formalisation, conformité fiscale).
- **Centre de validation**: workflow d’approbation des transactions/factures.
- **Certification numérique**: tampon légal + journal des audits.
- **Suivi formalisation**: plan d’action par client, rappels automatiques.
- **Collaboration**: annotations et commentaires sur pièces.

---

## Lot 3 – Administration Fiscale & Banques/Fintech

- **Administration fiscale**
  - [ ] Tableau de conformité, génération déclarations pré-remplies.
  - [ ] Vérification NIF, historique obligations, analytics macro.
- **Banques / Fintechs**
  - [ ] Scoring automatisé, dossiers prêts/micro-crédit.
  - [ ] Partenariats et suivi déboursements.
- **APIs externes**
  - [ ] Intégrations DGI (mock → prod).
  - [ ] Connecteurs bancaires/Mobile Money (MTN, Moov, Orange, Wave).

---

## Lot 4 – Transversal & Finitions

- **Notifications & gamification avancées** (SSE/WebSocket, badges progression).
- **Synchronisation automatique** banques + mobile money (jobs programmés).
- **Accessibilité & internationalisation** (FR → EN).
- **Tests E2E + CI/CD** (front + backend).
- **Documentation finale**: guides utilisateur, runbooks, changelog.
- **Plan de déploiement**: infrastructure cible, monitoring, SLA.

---

## Suivi & Cadence

- **Points hebdomadaires**: synthèse avancement + mise à jour de ce document.
- **Démo** à la fin de chaque lot.
- **KPIs**: vélocité, couverture tests, satisfaction personas.

---

## Ressources utiles

- Portail eMcf (DGI Bénin): https://sygmef.impots.bj/emcf/Vsfe
- e-Services (DGI Bénin): https://e-services.impots.bj/login-facile
- Dépôt Git (origin): https://github.com/flori92/financia.git

### Équipe Business
- [ ] Comptabilité OHADA (20h)
- [ ] Fiscalité Bénin (10h)
- [ ] Mobile Money usage (5h)

---

## ✅ Checklist Avant Démarrage Dev

- [ ] Budget validé ✅
- [ ] Équipe recrutée (minimum 2 devs)
- [ ] Serveur dev opérationnel
- [ ] Repository Git créé
- [ ] Outils collaboration configurés
- [ ] 5 entreprises pilotes identifiées
- [ ] Compte Flutterwave sandbox créé
- [ ] Planning détaillé semaine par semaine

---

## 📝 Notes Importantes

> **Règle #1**: Toujours tester avec de vraies entreprises béninoises dès que possible.

> **Règle #2**: Le mode offline est la priorité absolue - sans lui, le projet échoue.

> **Règle #3**: Simplicité avant sophistication - l'UX doit être accessible aux artisans.

---

**Prochaine révision**: Lundi prochain  
**Responsable**: Chef de Projet FINANCIA PRO  
**Dernière mise à jour**: Aujourd'hui
