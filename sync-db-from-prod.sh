#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
REMOTE_HOST="alldevs-hetzner"
REMOTE_DIR="~/ssvk"
DUMP_FILE="/tmp/ssvk_prod_dump_$(date +%Y%m%d_%H%M%S).sql"

echo "→ Dumping production DB from $REMOTE_HOST..."
ssh "$REMOTE_HOST" "cd $REMOTE_DIR && docker compose exec -T postgres pg_dump -U ssvk ssvk" > "$DUMP_FILE"
echo "  Dump size: $(du -h "$DUMP_FILE" | cut -f1)"

echo "→ Restoring to local PostgreSQL..."
cd "$PROJECT_DIR"
docker compose exec -T postgres psql -U ssvk -d postgres -c "DROP DATABASE IF EXISTS ssvk WITH (FORCE);"
docker compose exec -T postgres psql -U ssvk -d postgres -c "CREATE DATABASE ssvk;"
docker compose exec -T postgres psql -U ssvk ssvk < "$DUMP_FILE"

rm "$DUMP_FILE"
echo "✓ Production DB synced to local."
