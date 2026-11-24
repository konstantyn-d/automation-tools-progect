#!/bin/sh
# Runs once before n8n starts (service "n8n-import" in docker-compose.yml).
# Puts the credentials and the workflows of this folder into n8n and publishes them,
# so a fresh install works without clicking anything. The passwords come from .env,
# they are never stored in git.
# After the first run it does nothing, so changes you make in the n8n editor are kept.
# To import again: docker compose run --rm n8n-import --force
set -e
MARKER=/home/node/.n8n/.loopcasts-imported
if [ -f "$MARKER" ] && [ "$1" != "--force" ]; then
  echo "Workflows were imported before, nothing to do."
  exit 0
fi

sed -e "s|__DB_HOST__|${LC_DB_HOST:-db}|" \
    -e "s|__SMTP_HOST__|${LC_SMTP_HOST:-mailpit}|" \
    -e "s|__POSTGRES_USER__|${POSTGRES_USER:-loopcasts}|" \
    -e "s|__POSTGRES_PASSWORD__|${POSTGRES_PASSWORD}|" \
    /workflows/credentials.template.json > /tmp/credentials.json
n8n import:credentials --input=/tmp/credentials.json
rm /tmp/credentials.json

n8n import:workflow --separate --input=/workflows/workflows
for f in /workflows/workflows/*.json; do
  id=$(sed -n 's/^  "id": "\(.*\)",$/\1/p' "$f" | head -n 1)
  n8n publish:workflow --id="$id"
done

touch "$MARKER"
echo "Imported and published the LoopCasts workflows."
