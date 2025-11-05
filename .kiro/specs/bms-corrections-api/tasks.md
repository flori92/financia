# Implementation Plan

- [-] 1. Setup et préparation de l'environnement
  - Vérifier la branche distante clean-main et créer une branche de travail
  - Installer Railway CLI pour le déploiement
  - Vérifier la configuration des variables d'environnement
  - _Requirements: 4.1, 4.2_

- [-] 1.1 Configurer l'environnement de développement
  - Exécuter `git fetch origin` pour récupérer les dernières modifications
  - Créer une branche de travail depuis `origin/clean-main`: `git checkout -b fix/api-standardization origin/clean-main`
  - Vérifier que les dépendances sont installées dans `bms-web` et `bms/api-gateway`
  - _Requirements: 4.1_

- [ ] 1.2 Installer et configurer Railway CLI
  - Installer Railway CLI: `npm install -g @railway/cli` ou via script d'installation
  - Vérifier l'installation: `railway --version`
  - Se connecter à Railway: `railway login`
  - Lister les projets disponibles: `railway list`
  - _Requirements: 4.2_

- [ ] 2. Améliorer le client API frontend
  - Améliorer la gestion des erreurs dans `bms-web/src/lib/api.ts`
  - Créer un fichier de gestion d'erreurs `bms-web/src/lib/errors.ts`
  - Ajouter des types TypeScript pour les réponses API
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2, 5.4_

- [ ] 2.1 Améliorer la gestion des erreurs dans le client API
  - Créer `bms-web/src/lib/errors.ts` avec la classe `ApiError` et la fonction `handleApiError`
  - Modifier `bms-web/src/lib/api.ts` pour utiliser la nouvelle gestion d'erreurs
  - Ajouter des logs de debugging pour les erreurs
  - Implémenter un système de retry pour les requêtes échouées
  - _Requirements: 1.4, 5.1, 5.2, 5.4_

- [ ] 2.2 Ajouter des types TypeScript pour les API
  - Créer `bms-web/src/types/api.ts` avec les interfaces pour les réponses API
  - Définir les types pour Email, SMS, WhatsApp, Template
  - Ajouter les types pour les erreurs API
  - _Requirements: 1.1, 3.3_

- [ ] 3. Créer le module Communications backend
  - Créer la structure du module dans `bms/api-gateway/src/communications/`
  - Implémenter les entités TypeORM
  - Créer les DTOs de validation
  - Implémenter le service avec intégration au NotificationsService
  - Implémenter le contrôleur avec tous les endpoints
  - Enregistrer le module dans AppModule
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 3.1 Créer la structure du module Communications
  - Créer le dossier `bms/api-gateway/src/communications/`
  - Créer les sous-dossiers: `dto/`, `entities/`, `interfaces/`
  - Créer `communications.module.ts` avec les imports de base
  - Créer `communications.controller.ts` avec le décorateur @Controller
  - Créer `communications.service.ts` avec le décorateur @Injectable
  - _Requirements: 2.6_

- [ ] 3.2 Implémenter les entités TypeORM
  - Créer `entities/email.entity.ts` avec tous les champs (id, companyId, from, to, subject, body, read, starred, folder, hasAttachment, attachments, metadata, timestamps)
  - Créer `entities/sms.entity.ts` avec les champs (id, companyId, from, to, message, status, direction, metadata, sentAt)
  - Créer `entities/whatsapp.entity.ts` avec les champs (id, companyId, from, to, message, type, status, read, media, metadata, sentAt)
  - Créer `entities/template.entity.ts` avec les champs (id, companyId, name, type, subject, content, variables, active, metadata, timestamps)
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 3.3 Créer les DTOs de validation
  - Créer `dto/create-email.dto.ts` avec validation class-validator
  - Créer `dto/create-sms.dto.ts` avec validation
  - Créer `dto/create-whatsapp.dto.ts` avec validation
  - Créer `dto/create-template.dto.ts` avec validation
  - Créer `dto/update-template.dto.ts` avec PartialType
  - Créer les DTOs de query (GetEmailsDto, GetSMSDto, etc.)
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 3.4 Implémenter le service Communications
  - Injecter NotificationsService et les repositories TypeORM
  - Implémenter `getEmails()` avec filtrage par companyId et folder
  - Implémenter `sendEmail()` qui utilise NotificationsService et sauvegarde l'historique
  - Implémenter `getSMS()` avec filtrage
  - Implémenter `sendSMS()` avec intégration NotificationsService
  - Implémenter `getWhatsAppMessages()` avec filtrage
  - Implémenter `sendWhatsApp()` avec intégration NotificationsService
  - Implémenter les méthodes de gestion des templates (CRUD complet)
  - Implémenter `applyTemplate()` pour remplacer les variables dans les templates
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3.5 Implémenter le contrôleur Communications
  - Ajouter les endpoints GET `/communications/emails` et GET `/communications/emails/:id`
  - Ajouter les endpoints POST `/communications/emails` et DELETE `/communications/emails/:id`
  - Ajouter les endpoints GET `/communications/sms` et POST `/communications/sms`
  - Ajouter les endpoints GET `/communications/whatsapp` et POST `/communications/whatsapp`
  - Ajouter les endpoints CRUD pour `/communications/templates`
  - Ajouter les guards d'authentification et les décorateurs Swagger
  - Implémenter l'extraction du companyId depuis le contexte de la requête
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3.6 Enregistrer le module dans AppModule
  - Importer CommunicationsModule dans `bms/api-gateway/src/app.module.ts`
  - Ajouter TypeOrmModule.forFeature avec les entités Communications
  - Vérifier que le module est correctement chargé au démarrage
  - _Requirements: 2.6_

- [ ] 4. Créer les migrations de base de données
  - Créer la migration pour la table `communications_emails`
  - Créer la migration pour la table `communications_sms`
  - Créer la migration pour la table `communications_whatsapp`
  - Créer la migration pour la table `communications_templates`
  - Ajouter les index pour optimiser les requêtes
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 4.1 Créer les migrations SQL
  - Créer `bms/api-gateway/migrations/create-communications-tables.sql`
  - Définir la table `communications_emails` avec tous les champs et contraintes
  - Définir la table `communications_sms` avec tous les champs
  - Définir la table `communications_whatsapp` avec tous les champs
  - Définir la table `communications_templates` avec tous les champs
  - Ajouter les index: `idx_emails_company_folder`, `idx_emails_created`, `idx_sms_company`, `idx_whatsapp_company`, `idx_templates_company`
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 5. Migrer les pages Communications frontend
  - Mettre à jour la page emails pour utiliser le client API centralisé
  - Mettre à jour la page SMS
  - Mettre à jour la page WhatsApp
  - Mettre à jour la page templates
  - Supprimer tous les appels hardcodés à localhost:3001
  - _Requirements: 1.1, 1.3, 2.1, 2.2, 2.3, 2.4_

- [ ] 5.1 Migrer la page emails
  - Modifier `bms-web/src/app/communications/emails/page.tsx`
  - Remplacer les appels `fetch('http://localhost:3001/...')` par `apiGet('/api/v1/communications/emails')`
  - Supprimer l'import inutilisé `Mail`
  - Ajouter la gestion d'erreurs avec try/catch et affichage des erreurs
  - Ajouter un état de chargement approprié
  - Implémenter la gestion des erreurs réseau
  - _Requirements: 1.1, 1.3, 2.1, 3.1, 5.1, 5.2_

- [ ] 5.2 Migrer la page SMS
  - Modifier `bms-web/src/app/communications/sms/page.tsx`
  - Remplacer les appels fetch hardcodés par `apiGet('/api/v1/communications/sms')`
  - Ajouter la gestion d'erreurs
  - Ajouter un état de chargement
  - _Requirements: 1.1, 1.3, 2.2, 5.1, 5.2_

- [ ] 5.3 Migrer la page WhatsApp
  - Modifier `bms-web/src/app/communications/whatsapp/page.tsx`
  - Remplacer les appels fetch hardcodés par `apiGet('/api/v1/communications/whatsapp')`
  - Ajouter la gestion d'erreurs
  - Ajouter un état de chargement
  - _Requirements: 1.1, 1.3, 2.3, 5.1, 5.2_

- [ ] 5.4 Migrer la page templates
  - Modifier `bms-web/src/app/communications/templates/page.tsx`
  - Remplacer les appels fetch hardcodés par `apiGet('/api/v1/communications/templates')`
  - Ajouter la gestion d'erreurs
  - Ajouter un état de chargement
  - _Requirements: 1.1, 1.3, 2.4, 5.1, 5.2_

- [ ] 6. Nettoyer les autres pages avec URLs hardcodées
  - Identifier toutes les pages utilisant des URLs hardcodées
  - Migrer chaque page vers le client API centralisé
  - Vérifier qu'aucune URL localhost:3001 ne reste dans le code
  - _Requirements: 1.1, 1.3_

- [ ] 6.1 Migrer les pages Budget
  - Modifier `bms-web/src/app/budget/page.tsx`
  - Remplacer tous les appels fetch hardcodés par apiPost
  - Ajouter la gestion d'erreurs
  - _Requirements: 1.1, 1.3_

- [ ] 6.2 Migrer les pages Entrepreneur
  - Modifier `bms-web/src/app/entrepreneur/direct-debits/page.tsx`
  - Remplacer tous les appels fetch hardcodés par le client API
  - Ajouter la gestion d'erreurs
  - _Requirements: 1.1, 1.3_

- [ ] 6.3 Migrer les pages Marketing
  - Modifier `bms-web/src/app/marketing/campaigns/page.tsx`
  - Remplacer les appels fetch hardcodés
  - Ajouter la gestion d'erreurs
  - _Requirements: 1.1, 1.3_

- [ ] 6.4 Migrer les pages Support
  - Modifier `bms-web/src/app/support/tickets/page.tsx`
  - Remplacer les appels fetch hardcodés
  - Ajouter la gestion d'erreurs
  - _Requirements: 1.1, 1.3_

- [ ] 6.5 Migrer les pages AI
  - Modifier `bms-web/src/app/ai/chat/page.tsx` et `bms-web/src/app/ai/ocr/page.tsx`
  - Remplacer les appels fetch hardcodés
  - Ajouter la gestion d'erreurs
  - _Requirements: 1.1, 1.3_

- [ ] 6.6 Migrer les pages Accountant
  - Modifier les pages dans `bms-web/src/app/accountant/` (bank, tax/vat, journal, chart-of-accounts, trial-balance)
  - Remplacer tous les appels fetch hardcodés
  - Ajouter la gestion d'erreurs
  - _Requirements: 1.1, 1.3_

- [ ] 6.7 Migrer la page Login
  - Modifier `bms-web/src/app/login/page.tsx`
  - Remplacer l'appel fetch hardcodé pour le login
  - Utiliser le client API avec l'option skipAuth
  - _Requirements: 1.1, 1.3, 1.5_

- [ ] 7. Nettoyer le code et corriger les warnings
  - Supprimer tous les imports inutilisés
  - Corriger les warnings TypeScript
  - Exécuter le linter et corriger les problèmes
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 7.1 Nettoyer les imports inutilisés
  - Exécuter `npm run lint` dans `bms-web` pour identifier les imports inutilisés
  - Supprimer tous les imports inutilisés dans les fichiers identifiés
  - Vérifier particulièrement les pages communications
  - _Requirements: 3.1, 3.2_

- [ ] 7.2 Corriger les warnings TypeScript
  - Exécuter `npm run build` dans `bms-web` pour identifier les warnings
  - Corriger tous les warnings de variables non utilisées
  - Corriger les warnings de types manquants
  - _Requirements: 3.2, 3.3_

- [ ]* 7.3 Exécuter le linter et corriger les problèmes
  - Exécuter `npm run lint -- --fix` dans `bms-web`
  - Exécuter `npm run lint -- --fix` dans `bms/api-gateway`
  - Corriger manuellement les problèmes qui ne peuvent pas être auto-fixés
  - _Requirements: 3.3, 3.4_

- [ ] 8. Tester l'application localement
  - Démarrer le backend et vérifier que le module Communications est chargé
  - Démarrer le frontend et tester les pages Communications
  - Vérifier que toutes les pages fonctionnent sans erreurs
  - Tester les flux complets (envoi email, SMS, etc.)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 5.1, 5.2, 5.3, 5.5_

- [ ] 8.1 Tester le backend localement
  - Démarrer le backend: `cd bms/api-gateway && npm run start:dev`
  - Vérifier dans les logs que CommunicationsModule est chargé
  - Tester les endpoints avec curl ou Postman: GET /api/v1/communications/emails, /sms, /whatsapp, /templates
  - Vérifier que les endpoints retournent des données (même vides au début)
  - _Requirements: 2.5, 2.6_

- [ ] 8.2 Tester le frontend localement
  - Démarrer le frontend: `cd bms-web && npm run dev`
  - Ouvrir http://localhost:3000 et se connecter
  - Naviguer vers /communications/emails et vérifier qu'il n'y a pas d'erreurs console
  - Naviguer vers /communications/sms, /communications/whatsapp, /communications/templates
  - Vérifier que les états de chargement s'affichent correctement
  - Vérifier que les erreurs sont gérées gracieusement si l'API est indisponible
  - _Requirements: 1.1, 1.3, 5.1, 5.2, 5.3, 5.5_

- [ ] 8.3 Tester les autres pages migrées
  - Tester les pages Budget, Entrepreneur, Marketing, Support, AI, Accountant
  - Vérifier qu'aucune erreur de réseau n'apparaît dans la console
  - Vérifier que les données se chargent correctement
  - _Requirements: 1.1, 1.3_

- [ ] 9. Préparer le déploiement sur Railway
  - Vérifier la configuration Railway du projet
  - Mettre à jour les variables d'environnement sur Railway
  - Créer un script de migration pour la base de données
  - Tester le déploiement sur un environnement de staging si disponible
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 9.1 Configurer Railway pour le backend
  - Se connecter au projet Railway: `railway link`
  - Vérifier les services existants: `railway status`
  - Ajouter les variables d'environnement nécessaires pour le module Communications
  - Vérifier la configuration de la base de données PostgreSQL
  - _Requirements: 4.2_

- [ ] 9.2 Exécuter les migrations sur Railway
  - Créer un script `bms/api-gateway/scripts/run-migrations.sh` pour exécuter les migrations SQL
  - Se connecter à la base de données Railway: `railway run psql`
  - Exécuter les migrations: `railway run npm run db:migrate` ou via psql
  - Vérifier que les tables ont été créées correctement
  - _Requirements: 4.1, 4.2_

- [ ] 9.3 Configurer Railway pour le frontend
  - Vérifier que NEXT_PUBLIC_API_URL pointe vers l'URL du backend Railway
  - Vérifier les autres variables d'environnement (NEXTAUTH_URL, etc.)
  - Tester le build: `railway run npm run build` dans bms-web
  - _Requirements: 4.1, 4.2_

- [ ] 10. Déployer sur Railway
  - Pousser les changements sur la branche clean-main
  - Déclencher le déploiement sur Railway
  - Vérifier les logs de déploiement
  - Tester l'application en production
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 10.1 Pousser les changements
  - Vérifier que tous les tests passent localement
  - Commit les changements: `git add . && git commit -m "feat: standardize API calls and add Communications module"`
  - Pousser vers origin/clean-main: `git push origin fix/api-standardization:clean-main`
  - _Requirements: 4.1_

- [ ] 10.2 Déployer sur Railway
  - Vérifier que Railway détecte le push et démarre le déploiement
  - Suivre les logs de déploiement: `railway logs`
  - Vérifier que le backend démarre sans erreurs
  - Vérifier que le frontend démarre sans erreurs
  - _Requirements: 4.2_

- [ ] 10.3 Tester en production
  - Ouvrir l'URL de production du frontend
  - Se connecter avec un compte de test
  - Tester les pages Communications
  - Tester les autres pages migrées
  - Vérifier qu'il n'y a pas d'erreurs dans les logs Railway
  - Vérifier les métriques de performance
  - _Requirements: 4.3, 5.1, 5.2, 5.3, 5.5_

- [ ] 11. Documentation et finalisation
  - Mettre à jour le README avec les nouvelles fonctionnalités
  - Documenter les nouveaux endpoints API
  - Créer un guide de migration pour les développeurs
  - Mettre à jour la documentation Swagger
  - _Requirements: 4.3_

- [ ] 11.1 Mettre à jour la documentation
  - Ajouter une section "Module Communications" dans le README
  - Documenter les endpoints dans un fichier `docs/API_COMMUNICATIONS.md`
  - Mettre à jour la liste des modules disponibles
  - Documenter les variables d'environnement nécessaires
  - _Requirements: 4.3_

- [ ]* 11.2 Créer un guide de migration
  - Créer `docs/MIGRATION_API_CLIENT.md` expliquant comment migrer du fetch hardcodé vers le client API
  - Inclure des exemples de code avant/après
  - Documenter les bonnes pratiques de gestion d'erreurs
  - _Requirements: 4.3_
