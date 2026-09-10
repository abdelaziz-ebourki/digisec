#!/usr/bin/env bash
# Backup the DIGISEC MariaDB database and prune old backups.
#
# Usage:
#   scripts/backup-db.sh            # backup to ./backups/digisec-<timestamp>.sql.gz, keep 7
#   scripts/backup-db.sh <dir>      # backup to <dir> instead
#   KEEP=14 scripts/backup-db.sh    # keep 14 most recent backups
#
# Restore drill (proves the dump is valid without touching prod data):
#   gunzip -c backups/digisec-<ts>.sql.gz \
#     | docker compose exec -T db mariadb -udigisec -p"$DB_PASSWORD" temp_restore
#   (create the empty temp_restore database first, drop it afterwards)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${1:-$ROOT/backups}"
KEEP="${KEEP:-7}"

if [ -f "$ROOT/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$ROOT/.env"
  set +a
fi

: "${DB_USERNAME:?set DB_USERNAME in .env}"
: "${DB_PASSWORD:?set DB_PASSWORD in .env}"
DB_NAME="${DB_NAME:-digisec}"

mkdir -p "$DEST"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$DEST/digisec-$STAMP.sql.gz"

docker compose -f "$ROOT/docker-compose.yml" exec -T db \
  mariadb-dump -u"$DB_USERNAME" -p"$DB_PASSWORD" --single-transaction "$DB_NAME" \
  | gzip > "$OUT"

echo "backup written: $OUT ($(du -h "$OUT" | cut -f1))"

# Prune, keeping the $KEEP most recent.
ls -1t "$DEST"/digisec-*.sql.gz | tail -n +$((KEEP + 1)) | xargs -r rm -f
echo "backups kept: $(ls -1 "$DEST"/digisec-*.sql.gz 2>/dev/null | wc -l)"
