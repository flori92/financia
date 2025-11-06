#!/usr/bin/env bash
set -euo pipefail

# Synchronise la base Railway vers la base locale dockerisée
# Nécessite que la variable RAILWAY_DATABASE_URL soit définie (.env.local)

if [[ -z "${RAILWAY_DATABASE_URL:-}" ]]; then
  echo "RAILWAY_DATABASE_URL n'est pas défini. Veuillez l'exporter ou le placer dans .env.local"
  exit 1
fi

LOCAL_URL=${LOCAL_DATABASE_URL:-"postgresql://bms:bms_dev_password@localhost:5432/bms"}
BACKUP_DIR=${BACKUP_DIR:-"./backups"}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"
DUMP_FILE="$BACKUP_DIR/railway_${TIMESTAMP}.dump"

echo "🛫 Dump Railway -> $DUMP_FILE"
pg_dump "$RAILWAY_DATABASE_URL" --format=custom --verbose --file="$DUMP_FILE"

echo "🛬 Restauration vers $LOCAL_URL"
pg_restore --clean --if-exists --no-owner --verbose --dbname="$LOCAL_URL" "$DUMP_FILE"

echo "✅ Synchronisation terminée"
