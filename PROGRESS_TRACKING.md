# BMS – Suivi de Progression (Lots & Personas)

## Lot 0 – Préparation

- [x] Backlog unifié dans `NEXT_ACTIONS.md`
- [x] Seeds de base (entreprise, factures, paiements, allocation)
- [x] Demande NIF de démo (pending)
- [x] Utilisateur démo Entrepreneur (`demo@bms.test`)
- [x] Utilisateurs démo (Comptable, Admin fiscal, Banque)
- [x] Normalisation route Paiements (`/api/v1/payments`)
- [x] Documentation rationalisée (`BMS_CAHIER_DES_CHARGES.md` + `NEXT_ACTIONS.md`)
- [x] Multi‑sociétés – sélection et propagation (Topbar + `bms-company-changed`)

## Personas – Comptes démo (alignés sur les seeds)

- Entrepreneur: `entrepreneur@test.bj`
- Comptable: `comptable@cabinet.bj`
- Admin fiscal: `taxadmin@dgi.bj`
- Admin: `admin@bms.bj`

Mot de passe commun (dev): `password123`

## Lot 1 – Parcours Entrepreneur (MVP)

- [x] Dashboard connecté (KPIs tréso/revenus/impayés/dépenses, alertes critiques runway)
- [x] Transactions CRUD + export CSV (import Mobile Money mock à venir)
- [x] Facturation actions (submit/cancel/send présentes, upload pièces à venir)
- [x] Trésorerie – cashflow (endpoints + front: KPIs, séries, solde, alertes)
- [x] Trésorerie – prévisions 7/30 jours + recommandations
- [x] Formalisation/NIF: page complète (checklist documents, statut, timeline, formulaire)
- [ ] Tests unitaires services Nest + composants React

## Lot 2 – Parcours Expert-Comptable

- [x] Dashboard multi-clients + filtres (sélection société)
- [x] Centre de validation (workflow)
- [x] Audit log (journalisation des validations)
- [ ] Certification numérique (signature/tampon légal)
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
