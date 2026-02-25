#!/bin/bash
# Быстрое обновление кода на VM и перезапуск контейнеров
# Использование: ./scripts/update_vm.sh

set -e

cd "$(dirname "$0")/.."

echo "🔄 Обновление кода на VM..."

# Сохраняем .env файлы
if [ -f backend/.env ]; then
  cp backend/.env /tmp/backend.env.bak
  echo "✅ Сохранен backend/.env"
fi

# Обновляем код из репозитория
echo "📥 Получение изменений из git..."
git fetch origin
git reset --hard origin/main

# Восстанавливаем .env файлы
if [ -f /tmp/backend.env.bak ]; then
  cp /tmp/backend.env.bak backend/.env
  rm /tmp/backend.env.bak
  echo "✅ Восстановлен backend/.env"
fi

# Пересобираем и перезапускаем контейнеры
echo "🔨 Пересборка и перезапуск контейнеров..."
cd infra
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo ""
echo "✅ Обновление завершено!"
echo ""
echo "Проверка статуса:"
docker-compose ps
