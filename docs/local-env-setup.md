# Environnement local BMS (ISO Railway)

Ce guide décrit comment reproduire l'infrastructure Railway (Postgres, Redis, fichiers, backend, frontend) en local pour obtenir un environnement de test fidèle à la production.

## 1. Prérequis

- Docker & Docker Compose
- `psql` et `pg_dump` installés (PostgreSQL client)
- Accès aux variables Railway (DATABASE_URL, REDIS_URL, etc.)
- Node.js si vous souhaitez exécuter les apps hors Docker

## 2. Fichiers d'environnement

### Racine

1. Copier `.env.local.example` en `.env.local` et renseigner :
   - `RAILWAY_DATABASE_URL`, `RAILWAY_REDIS_URL`
   - Secrets globaux (JWT, ENCRYPTION_KEY, clés providers, etc.)
2. Les variables listées reflètent l'environnement Railway **production** ; l'environnement Railway `dev` étant un clone, vous pouvez y prélever les mêmes valeurs si besoin.

### API Gateway

1. Copier `bms/api-gateway/.env.local.example` en `bms/api-gateway/.env.local`.
2. Toutes les variables présentes correspondent aux clés utilisées en production (Resend, Africa's Talking, AI services, Kkiapay, etc.) afin d'assurer un comportement identique.
3. Pour utiliser l'environnement Railway `dev`, substituer simplement les valeurs par celles de `dev` si vous souhaitez tester sur cette réplique.

### Frontend (bms-web)

1. Copier `bms-web/.env.local.example` en `bms-web/.env.local`.
2. Les variables exposées reprennent la configuration Railway (URL API, NextAuth, version d'appli). `NEXT_PUBLIC_API_URL` doit pointer vers l'API locale ou Railway selon le scénario test.

## 3. Démarrage de la stack Docker

```bash
# À la racine du repo MERP
cp .env.local.example .env.local              # puis éditer
cp bms/api-gateway/.env.local.example bms/api-gateway/.env.local
cp bms-web/.env.local.example bms-web/.env.local

# Lancer les services
docker compose up --build
```

Services disponibles :
- API NestJS : http://localhost:3001
- Frontend Next.js : http://localhost:3000
- Postgres : localhost:5432 (user/pass `bms` / `bms_dev_password`)
- Redis : localhost:6379
- Stockage objet :
  - MinIO local (défaut) : http://localhost:9000 (console http://localhost:9001)
  - Cloudflare R2 (option) : utiliser l'endpoint S3-compatible `https://42fc982266a2c31b942593b18097e4b3.r2.cloudflarestorage.com` + bucket `bms`

> Pour basculer sur R2 : définir `STORAGE_PROVIDER=r2` et renseigner `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_FORCE_PATH_STYLE=true` dans vos `.env.local`. Le `docker-compose` réutilise ces variables pour l'API et le worker.

## 4. Synchroniser la base Railway → local

Un script `scripts/sync-railway-to-local.sh` est fourni.

```bash
export RAILWAY_DATABASE_URL="postgresql://user:pass@host:port/db"
./scripts/sync-railway-to-local.sh
```

Ce script :
1. Réalise un `pg_dump` de la base Railway (format custom) dans `./backups/`.
2. Restaure la sauvegarde dans la base locale `bms` (via `pg_restore --clean`).

> ⚠️ Les données locales sont écrasées à chaque restauration. À utiliser avec précaution.

## 5. Adapter la configuration Jest / tests

Pour exécuter les tests e2e de l'API :
1. Lancer la stack Docker (Postgres + Redis).
2. Définir `DATABASE_URL` pointant vers la base de test (`bms_test`) si vous souhaitez isoler les données de test.
3. Exécuter `npm run test` dans `bms/api-gateway` (Jest utilisera `ts-jest`).

## 6. Synchronisation inverse (local → Railway)

En cas de besoin :

```bash
pg_dump "postgresql://bms:bms_dev_password@localhost:5432/bms" --format=custom --file=local.dump
pg_restore --clean --if-exists --no-owner --dbname="$RAILWAY_DATABASE_URL" local.dump
```

Assurez-vous de ne pas écraser involontairement des données de production.

## 7. Astuces supplémentaires

- **MinIO** : utilisez `mc alias set` pour interagir avec le bucket `bms-uploads`.
- **Bull / Redis** : videz les queues à l'aide de `redis-cli` (`FLUSHALL`) si nécessaire.
- **Cron / Scheduler** : les jobs (ex. trésorerie) tourneront si `ScheduleModule` est actif ; désactivez via env si besoin pour éviter du spam dans l'environnement local.
- **Ollama** : par défaut on pointe vers `http://ollama:11434`. Si vous n'utilisez pas les fonctionnalités IA, laissez vide ou désactivez le module.

## 8. Nettoyage

```bash
docker compose down --volumes
```

Supprime les conteneurs et volumes (base/redis/minio).

---

Avec cette configuration, l'environnement local reproduit fidèlement la stack Railway, ce qui permet de valider les migrations, les tests end-to-end et les intégrations externes avant déploiement.
