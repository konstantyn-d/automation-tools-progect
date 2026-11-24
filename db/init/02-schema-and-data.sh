#!/bin/sh
# Runs once, when the Postgres volume is created (docker compose up on a fresh machine).
#   1. the schema: db/migrations/*.sql in order
#   2. the data: the cleaned legacy data if data/clean/ is there, otherwise products and prices only
#   3. the 60 courses of the new site
# To start again from zero: docker compose down -v && docker compose up -d
set -e
run() { psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname loopcasts "$@"; }

run -c "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())"
for f in /db/migrations/*.sql; do
  echo "schema: $(basename "$f")"
  run -f "$f"
  run -c "INSERT INTO schema_migrations (name) VALUES ('$(basename "$f")')"
done

if [ -f /seed/data/products.csv ]; then
  echo "data: loading the cleaned legacy data from data/clean/"
  run -f /db/seed/load.sql
else
  echo "data: no data/clean/ folder, starting with products and prices only"
  run -f /db/seed/minimal.sql
fi
run -f /db/seed/site-courses.sql
