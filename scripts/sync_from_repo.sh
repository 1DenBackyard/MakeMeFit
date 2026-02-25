#!/bin/bash
# Скрипт для синхронизации файлов из git репозитория на VM
# Сохраняет существующие .env файлы

set -e

REPO_URL="${REPO_URL:-https://github.com/amesin/MakeMeFit.git}"
REPO_DIR="${REPO_DIR:-/opt/makemefit}"
BRANCH="${BRANCH:-main}"

echo "🔄 Синхронизация файлов из репозитория..."

# Переходим в директорию проекта
cd "$REPO_DIR" || {
    echo "❌ Директория $REPO_DIR не найдена!"
    echo "Сначала клонируйте репозиторий:"
    echo "  git clone $REPO_URL $REPO_DIR"
    exit 1
}

# Сохраняем .env файлы
echo "💾 Сохраняем существующие .env файлы..."
BACKUP_DIR="/tmp/makemefit_env_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -f backend/.env ]; then
    cp backend/.env "$BACKUP_DIR/backend.env"
    echo "  ✅ Сохранен backend/.env"
fi

if [ -f frontend/.env ]; then
    cp frontend/.env "$BACKUP_DIR/frontend.env"
    echo "  ✅ Сохранен frontend/.env"
fi

# Обновляем код из репозитория
echo "📥 Обновляем код из репозитория..."
if [ -d .git ]; then
    # Если это git репозиторий
    git fetch origin
    git reset --hard "origin/$BRANCH"
    echo "  ✅ Код обновлен из ветки $BRANCH"
else
    # Если нет git, клонируем заново
    echo "  ⚠️  .git не найден, клонируем репозиторий..."
    cd /tmp
    rm -rf makemefit_temp
    git clone "$REPO_URL" makemefit_temp
    rsync -av --exclude='.git' --exclude='backend/.env' --exclude='frontend/.env' \
        makemefit_temp/ "$REPO_DIR/"
    rm -rf makemefit_temp
    cd "$REPO_DIR"
    echo "  ✅ Код синхронизирован"
fi

# Восстанавливаем .env файлы
echo "📤 Восстанавливаем .env файлы..."
if [ -f "$BACKUP_DIR/backend.env" ]; then
    cp "$BACKUP_DIR/backend.env" backend/.env
    echo "  ✅ Восстановлен backend/.env"
fi

if [ -f "$BACKUP_DIR/frontend.env" ]; then
    cp "$BACKUP_DIR/frontend.env" frontend/.env
    echo "  ✅ Восстановлен frontend/.env"
fi

# Удаляем временную директорию
rm -rf "$BACKUP_DIR"

echo "✅ Синхронизация завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "  1. Проверьте изменения: cd $REPO_DIR && git status"
echo "  2. Перезапустите контейнеры: cd infra && docker-compose up -d --build"
echo "  3. Проверьте health: curl http://localhost:8000/health"
