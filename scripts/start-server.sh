#!/bin/bash
# Start the backend server, ensuring .env exists with required keys

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/../backend"
ENV_FILE="$BACKEND_DIR/.env"

cd "$BACKEND_DIR"

# Function to generate a random URL-safe token
generate_secret_key() {
    python3 -c "import secrets; print(secrets.token_urlsafe(32))"
}

# Function to generate a Fernet key
generate_fernet_key() {
    python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
}

# Create .env if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    echo "Creating $ENV_FILE with new keys..."
    touch "$ENV_FILE"
fi

# Check for SECRET_KEY
if ! grep -q "^SECRET_KEY=" "$ENV_FILE" 2>/dev/null; then
    echo "Generating SECRET_KEY..."
    echo "SECRET_KEY=$(generate_secret_key)" >> "$ENV_FILE"
fi

# Check for ENCRYPTION_KEY
if ! grep -q "^ENCRYPTION_KEY=" "$ENV_FILE" 2>/dev/null; then
    echo "Generating ENCRYPTION_KEY..."
    echo "ENCRYPTION_KEY=$(generate_fernet_key)" >> "$ENV_FILE"
fi

echo "Starting server with keys from $ENV_FILE"
exec uv run uvicorn app.main:app --reload "$@"
