#!/bin/bash
set -e

# Deploy script for JiraLocal with SQLite
# This script automates the setup steps from README.md

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env.docker"
ENV_TEMPLATE="$PROJECT_ROOT/.env.docker.example"
DOCKER_COMPOSE_FILE="$SCRIPT_DIR/docker-compose.sqlite.yml"

echo "=== JiraLocal Deployment Script ==="

# Function to check all prerequisites
check_prerequisites() {
    local missing_prerequisites=0

    echo "Checking prerequisites..."

    # Check for Python 3
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 is not installed or not in PATH"
        missing_prerequisites=1
    else
        echo "✓ Python 3 found: $(python3 --version)"
    fi

    # Check for Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed or not in PATH"
        missing_prerequisites=1
    else
        echo "✓ Docker found: $(docker --version)"
    fi

    # Check for Docker Compose (v2 or v1)
    if docker compose version &> /dev/null; then
        echo "✓ Docker Compose v2 found: $(docker compose version)"
    elif command -v docker-compose &> /dev/null; then
        echo "✓ Docker Compose v1 found: $(docker-compose --version)"
    else
        echo "❌ Docker Compose is not installed or not in PATH"
        missing_prerequisites=1
    fi

    # Check for required files
    if [ ! -f "$ENV_TEMPLATE" ]; then
        echo "❌ Environment template file not found: $ENV_TEMPLATE"
        missing_prerequisites=1
    else
        echo "✓ Environment template found: $ENV_TEMPLATE"
    fi

    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        echo "❌ Docker Compose file not found: $DOCKER_COMPOSE_FILE"
        missing_prerequisites=1
    else
        echo "✓ Docker Compose file found: $DOCKER_COMPOSE_FILE"
    fi

    if [ $missing_prerequisites -ne 0 ]; then
        echo ""
        echo "❌ Prerequisites check failed. Please install missing dependencies and try again."
        exit 1
    fi

    echo ""
    echo "✓ All prerequisites met."
    echo ""
}

# Check prerequisites before proceeding
check_prerequisites

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
    python3 -c "import secrets; import base64; print(base64.urlsafe_b64encode(secrets.token_bytes(32)).decode())"
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
echo "LaColaRij (JiraLocal) should now be running at http://localhost:6555/ ."
