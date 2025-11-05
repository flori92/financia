# Requirements Document

## Introduction

Ce document définit les exigences pour corriger les problèmes critiques du système BMS (Business Management System) afin d'assurer son bon fonctionnement. Les corrections portent sur la standardisation des appels API, l'implémentation des modules manquants, et l'amélioration de la qualité du code.

## Glossary

- **BMS**: Business Management System - Le système de gestion d'entreprise complet
- **API Gateway**: Le serveur backend NestJS qui expose les endpoints REST
- **Frontend**: L'application Next.js qui consomme l'API
- **Communications Module**: Module gérant les emails, SMS, WhatsApp et templates
- **API Client**: Bibliothèque centralisée pour effectuer les appels HTTP vers l'API

## Requirements

### Requirement 1: Standardisation des appels API

**User Story:** En tant que développeur, je veux que tous les appels API utilisent une configuration centralisée, afin d'éviter les URLs hardcodées et faciliter le déploiement.

#### Acceptance Criteria

1. WHEN the Frontend makes an API call, THE Frontend SHALL use the centralized API client library
2. WHEN the API client is configured, THE API client SHALL read the base URL from environment variables
3. THE Frontend SHALL NOT contain hardcoded localhost URLs in component files
4. WHEN an API call fails, THE API client SHALL provide consistent error handling
5. THE Frontend SHALL use the same authentication mechanism across all API calls

### Requirement 2: Implémentation du module Communications

**User Story:** En tant qu'utilisateur, je veux accéder aux fonctionnalités de communications (emails, SMS, WhatsApp), afin de gérer mes communications professionnelles depuis le système.

#### Acceptance Criteria

1. WHEN a user accesses the emails page, THE API Gateway SHALL return a list of emails
2. WHEN a user accesses the SMS page, THE API Gateway SHALL return a list of SMS messages
3. WHEN a user accesses the WhatsApp page, THE API Gateway SHALL return a list of WhatsApp conversations
4. WHEN a user accesses the templates page, THE API Gateway SHALL return a list of communication templates
5. THE API Gateway SHALL expose endpoints at `/api/v1/communications/emails`, `/api/v1/communications/sms`, `/api/v1/communications/whatsapp`, and `/api/v1/communications/templates`
6. WHEN the communications module is loaded, THE API Gateway SHALL register all communication routes

### Requirement 3: Nettoyage du code et qualité

**User Story:** En tant que développeur, je veux que le code soit propre et sans avertissements, afin de maintenir une base de code de qualité.

#### Acceptance Criteria

1. THE Frontend SHALL NOT contain unused imports in any file
2. WHEN TypeScript compiles the code, THE TypeScript compiler SHALL NOT report unused variable warnings
3. THE Frontend SHALL follow consistent coding patterns across all pages
4. WHEN a component is created, THE component SHALL only import necessary dependencies

### Requirement 4: Configuration et environnement

**User Story:** En tant qu'administrateur système, je veux que l'application utilise correctement les variables d'environnement, afin de faciliter le déploiement dans différents environnements.

#### Acceptance Criteria

1. WHEN the Frontend starts, THE Frontend SHALL read API URL from NEXT_PUBLIC_API_URL environment variable
2. WHEN the API Gateway starts, THE API Gateway SHALL read configuration from .env file
3. THE application SHALL provide clear error messages IF environment variables are missing
4. WHEN deployed to production, THE application SHALL use production URLs without code changes

### Requirement 5: Gestion des erreurs et résilience

**User Story:** En tant qu'utilisateur, je veux que l'application gère gracieusement les erreurs réseau, afin d'avoir une expérience utilisateur fluide même en cas de problème.

#### Acceptance Criteria

1. WHEN an API call fails, THE Frontend SHALL display a user-friendly error message
2. WHEN the API is unavailable, THE Frontend SHALL show a loading state or fallback UI
3. THE Frontend SHALL implement retry logic for failed requests WHERE appropriate
4. WHEN a network error occurs, THE Frontend SHALL log the error for debugging purposes
5. THE Frontend SHALL NOT crash IF the API returns unexpected data
