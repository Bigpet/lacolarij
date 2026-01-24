#!/bin/bash
set -e

# Deploy script for JiraLocal with SQLite
# This script automates the setup steps from README.md

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env.docker"
ENV_TEMPLATE="$PROJECT_ROOT/.env.docker.example"

echo "=== JiraLocal Deployment Script ==="

# Step 1: Create environment file from template if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    echo "Creating .env.docker from template..."
    cp "$ENV_TEMPLATE" "$ENV_FILE"
else
    echo ".env.docker already exists, skipping copy."
fi

# Step 2: Generate and add required secrets if not already set
generate_secret_key() {
    python3 -c "import secrets; print(secrets.token_urlsafe(32))"
}

generate_encryption_key() {
    python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
}

# Check if SECRET_KEY is empty and generate if needed
if grep -q "^SECRET_KEY=$" "$ENV_FILE"; then
    echo "Generating SECRET_KEY..."
    SECRET_KEY=$(generate_secret_key)
    sed -i "s/^SECRET_KEY=$/SECRET_KEY=$SECRET_KEY/" "$ENV_FILE"
    echo "SECRET_KEY has been set."
else
    echo "SECRET_KEY already set, skipping."
fi

# Check if ENCRYPTION_KEY is empty and generate if needed
if grep -q "^ENCRYPTION_KEY=$" "$ENV_FILE"; then
    echo "Generating ENCRYPTION_KEY..."
    ENCRYPTION_KEY=$(generate_encryption_key)
    sed -i "s/^ENCRYPTION_KEY=$/ENCRYPTION_KEY=$ENCRYPTION_KEY/" "$ENV_FILE"
    echo "ENCRYPTION_KEY has been set."
else
    echo "ENCRYPTION_KEY already set, skipping."
fi

# Step 3: Run the containers with SQLite
echo "Starting containers..."
docker compose -f "$SCRIPT_DIR/docker-compose.sqlite.yml" --env-file "$ENV_FILE" up --build -d

echo "=== Deployment complete ==="
echo "JiraLocal should now be running."
