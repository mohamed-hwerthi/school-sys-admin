#!/bin/bash
set -e

# ═══════════════════════════════════════
# EcoleNet Production Deployment Script
# ═══════════════════════════════════════

echo "=== EcoleNet Deployment ==="

# Check .env exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found. Copy .env.example to .env and configure."
    exit 1
fi

# Check required production vars
source .env
if [ -z "$DB_PASSWORD" ]; then
    echo "ERROR: DB_PASSWORD is not set in .env"
    exit 1
fi

# Pull latest
echo "Pulling latest changes..."
git pull origin main

# Build and deploy
echo "Building Docker images..."
docker compose -f docker-compose.prod.yml build

echo "Starting services..."
docker compose -f docker-compose.prod.yml up -d

# Wait for health
echo "Waiting for services to start..."
sleep 10

echo ""
echo "=== Service Status ==="
docker compose -f docker-compose.prod.yml ps

echo ""
echo "=== Deployment complete ==="
