#!/bin/bash
# Полная пересборка frontend с очисткой кэша

set -e

cd "$(dirname "$0")/.."

echo "🧹 Очистка Docker кэша для frontend..."
docker-compose -f infra/docker-compose.yml build --no-cache --pull frontend

echo "✅ Frontend пересобран!"
