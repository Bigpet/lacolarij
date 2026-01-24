#!/bin/bash
set -e

# Server deployment script for JiraLocal
# This script is meant to be copied to ~/localjira/server_deploy.sh
# and run from there to update the deployment

REPO_DIR="$HOME/localjira/lacolarij"
DEPLOY_SCRIPT="$HOME/localjira/server_deploy.sh"

echo "=== JiraLocal Server Update ==="

# Step 1: Stop running instance
echo "Stopping current instance..."
if [ -f "$REPO_DIR/deployment/stop.sh" ]; then
    cd "$REPO_DIR" && ./deployment/stop.sh || echo "No running instance to stop"
fi

# Step 2: Update repository to latest main
echo "Updating repository..."
cd "$REPO_DIR"
git fetch origin main
git reset --hard origin/main

# Step 3: Run deployment
echo "Starting deployment..."
./deployment/deploy.sh

# Step 4: Update this script with new version
echo "Updating deploy script..."
cp "$REPO_DIR/deployment/server_deploy.sh" "$DEPLOY_SCRIPT"

echo "=== Server update complete ==="
