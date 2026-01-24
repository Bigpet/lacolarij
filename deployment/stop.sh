#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env.docker"

echo "Stopping containers..."

docker compose -f "$SCRIPT_DIR/docker-compose.sqlite.yml" --env-file "$ENV_FILE" down
