#!/bin/bash
# Database backup script for School Management System
# Usage: ./scripts/backup-db.sh [database_name]
# Requires: pg_dump, POSTGRES_USER and POSTGRES_PASSWORD env vars

set -euo pipefail

DB_NAME="${1:-school_dev_db}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "Backing up database: ${DB_NAME}"
echo "Target: ${BACKUP_FILE}"

PGPASSWORD="${POSTGRES_PASSWORD:-postgres}" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-owner \
  --no-privileges \
  | gzip > "$BACKUP_FILE"

echo "Backup complete: ${BACKUP_FILE} ($(du -h "$BACKUP_FILE" | cut -f1))"

# Keep only last 30 backups
ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -n +31 | xargs -r rm --
echo "Old backups cleaned (keeping last 30)"
