# BMS – Suivi de Progression (Lots & Personas)

## Lot 0 – Préparation

- [x] Backlog unifié dans `NEXT_ACTIONS.md`
- [x] Seeds de base (entreprise, factures, paiements, allocation)
- [x] Demande NIF de démo (under_review)
- [x] Utilisateur démo Entrepreneur (`demo@bms.test`)
- [x] Utilisateurs démo (Comptable, Admin fiscal, Banque)
- [x] Normalisation route Paiements (`/api/v1/payments`)
- [x] Documentation rationalisée (`BMS_CAHIER_DES_CHARGES.md` + `NEXT_ACTIONS.md`)

## Personas – Comptes démo

- Entrepreneur: `demo@bms.test`
- Comptable: `accountant@bms.test`
- Admin fiscal: `taxadmin@bms.test`
- Banque: `bank@bms.test`

Mot de passe commun (dev): `BmsDemo123!`

## Lot 1 – Parcours Entrepreneur (MVP)

- [ ] Dashboard connecté (KPIs tréso/revenus/impayés, badge progression)
- [ ] Transactions CRUD + import Mobile Money (mock) + export CSV/PDF
- [ ] Facturation actions (submit/cancel/send) + upload pièces + archivage légal
- [ ] Trésorerie (cashflow) + prévisions 7/30 jours
- [ ] Formalisation/NIF: checklist + statut (UI)
- [ ] Tests unitaires services Nest + composants React

## Lot 2 – Parcours Expert-Comptable

- [ ] Dashboard multi-clients + filtres
- [ ] Centre de validation (workflow)
- [ ] Certification numérique + audit log
- [ ] Suivi formalisation + rappels

## Lot 3 – Administration Fiscale & Banques

- [ ] Conformité + déclarations pré-remplies (UI)
- [ ] Vérification NIF + historique
- [ ] Scoring, dossiers prêts, partenariats
- [ ] Connecteurs DGI/MM (mock→prod)

## Lot 4 – Transversal & Finitions

- [ ] Notifications & gamification (SSE/WebSocket)
- [ ] Sync auto banques/MM (jobs)
- [ ] A11y & i18n
- [ ] E2E + CI/CD
- [ ] Docs finales + runbooks + plan de déploiement
