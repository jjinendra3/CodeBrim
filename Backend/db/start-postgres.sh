#!/usr/bin/env bash
# Starts (or creates) the CodeBrim Postgres container on this host.
# Safe to re-run: an existing container is just started again.
#
# Usage:
#   POSTGRES_PASSWORD=<password> bash db/start-postgres.sh
#
# Data lives on the host at $PGDATA_DIR (default /var/lib/codebrim/postgres),
# outside the container, so removing or upgrading the container keeps the data.
# Point PGDATA_DIR at a separate EBS volume to make the data survive the
# instance itself (detach the volume, attach it to the new server, re-run this).
set -euo pipefail

CONTAINER=codebrim-postgres
IMAGE=postgres:17
PGDATA_DIR="${PGDATA_DIR:-/var/lib/codebrim/postgres}"
DB_USER=codebrim
DB_NAME=codebrim

if sudo docker container inspect "$CONTAINER" >/dev/null 2>&1; then
  echo "Container $CONTAINER already exists, making sure it is running."
  sudo docker start "$CONTAINER" >/dev/null
else
  if [ -z "${POSTGRES_PASSWORD:-}" ]; then
    echo "POSTGRES_PASSWORD is required on first run." >&2
    echo "Generate one with: openssl rand -hex 24" >&2
    exit 1
  fi

  sudo mkdir -p "$PGDATA_DIR"

  # Published on 127.0.0.1 only: the database must never be reachable from the
  # internet or from the containers that run user-submitted code.
  sudo docker run -d \
    --name "$CONTAINER" \
    --restart unless-stopped \
    -e POSTGRES_USER="$DB_USER" \
    -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
    -e POSTGRES_DB="$DB_NAME" \
    -v "$PGDATA_DIR":/var/lib/postgresql/data \
    -p 127.0.0.1:5432:5432 \
    "$IMAGE" -c shared_buffers=64MB >/dev/null
fi

echo "Waiting for Postgres to accept connections ..."
for _ in $(seq 1 30); do
  if sudo docker exec "$CONTAINER" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
    echo "Postgres is ready."
    echo "DATABASE_URL=postgresql://$DB_USER:<password>@127.0.0.1:5432/$DB_NAME"
    exit 0
  fi
  sleep 1
done

echo "Postgres did not become ready in 30s. Logs:" >&2
sudo docker logs --tail 50 "$CONTAINER" >&2
exit 1
