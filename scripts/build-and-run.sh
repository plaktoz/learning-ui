#!/usr/bin/env bash
# Brings up the full stack (db, backend, frontend) via podman-compose.
#
# Prisma's generated client (backend/generated/) is gitignored and must
# exist before the backend image builds, so this script regenerates it from
# db/ first. Migrations and the seed run against the db container's
# published host port (localhost:5432), the same way `next dev` would
# reach it outside a container — see db/.env.example and the root
# .env.example for the DATABASE_URL split between host and Compose network.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "No .env found at repo root — copy .env.example to .env first." >&2
  exit 1
fi

echo "==> Generating Prisma client (db/)"
(cd db && npm ci && npm run db:generate)

echo "==> Building images"
podman-compose build

echo "==> Starting db"
podman-compose up -d db

echo "==> Waiting for db to be healthy"
db_container="$(podman-compose ps -q)"
until [ "$(podman inspect "$db_container" --format '{{.State.Health.Status}}' 2>/dev/null)" = "healthy" ]; do
  sleep 1
done

echo "==> Running migrations + seed (db/)"
(cd db && npm run db:migrate:deploy && npm run db:seed)

echo "==> Starting backend + frontend"
podman-compose up -d backend frontend

echo "==> Stack is up: frontend http://localhost:3000, backend http://localhost:4000"
