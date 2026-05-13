#!/bin/sh
# =============================================================================
# Entrypoint for backend (NestJS + Prisma)
# 1. Runs Prisma migrations on startup
# 2. Seeds the database (if configured)
# 3. Starts the application
# =============================================================================

set -e

echo "⏳ Waiting for database to be ready..."
# Wait for PostgreSQL to be reachable
until pg_isready -h "$(echo $DATABASE_URL | sed -n 's/.*@\(.*\):.*/\1/p')" \
                 -p "$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')" \
                 -U "$(echo $DATABASE_URL | sed -n 's/.*:\/\/\(.*\):.*@.*/\1/p')" 2>/dev/null; do
  echo "  Waiting for postgres..."
  sleep 2
done
echo "✅ Database is ready!"

echo "⏳ Running Prisma migrations..."
npx prisma migrate deploy
npx prisma generate
echo "✅ Prisma migrations applied!"

echo "⏳ Running seed..."
npx prisma db seed || true
echo "✅ Seed complete!"

echo "🚀 Starting backend..."
exec node dist/main
