# Manual Deployment Instructions

This document describes how to deploy JiraLocal manually, without using the provided deployment scripts.

## Prerequisites

- Docker and Docker Compose installed
- Port 6555 available on the host (or configure `HOST_PORT` in `.env.docker`)

## Manual Setup

1. Create an environment file from the template:
   ```bash
   cp .env.docker.example .env.docker
   ```

2. Generate and add the required secrets to `.env.docker`:
   ```bash
   # Generate SECRET_KEY
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"

   # Generate ENCRYPTION_KEY
   python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   ```

3. Run the Containers

## Running with SQLite

```bash
docker-compose -f deployment/docker-compose.sqlite.yml --env-file .env.docker up --build -d
```

## Running with PostgreSQL

For PostgreSQL, also set `POSTGRES_PASSWORD` in `.env.docker`.

```bash
docker-compose -f deployment/docker-compose.postgres.yml --env-file .env.docker up --build -d
```

## Access

Once running, access the application at http://localhost:6555

To use a different port, set `HOST_PORT` in `.env.docker`:
```bash
# For production on port 80
echo "HOST_PORT=80" >> .env.docker
```

## Stopping

```bash
# SQLite
docker-compose -f deployment/docker-compose.sqlite.yml down

# PostgreSQL
docker-compose -f deployment/docker-compose.postgres.yml down

# To also remove volumes (WARNING: deletes all data)
docker-compose -f deployment/docker-compose.sqlite.yml down -v
```
