#!/bin/bash
set -e

PORT="${TEST_PORT:-8775}"
cd "$(dirname "$0")/../backend"

echo "Starting mock server on port $PORT..."
uv run uvicorn main:app --port "$PORT" &
SERVER_PID=$!

cleanup() { kill $SERVER_PID 2>/dev/null || true; }
trap cleanup EXIT

sleep 1

JIRA_URL="http://localhost:$PORT" \
JIRA_EMAIL="dummy@example.com" \
JIRA_PASSWORD="dummy_token" \
JIRA_PROJECT_KEY="TEST" \
JIRA_API_VERSION="${JIRA_API_VERSION:-3}" \
uv run pytest test_jira_api.py -v
