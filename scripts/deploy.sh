#!/bin/bash
set -e

# Конфигурация
DEPLOY_HOST="${DEPLOY_HOST:-your-server-ip}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
SSH_KEY="${SSH_KEY:-~/.ssh/makemefit_deploy}"
BRANCH="${BRANCH:-main}"

echo "🚀 Deploying to $DEPLOY_USER@$DEPLOY_HOST (branch: $BRANCH)..."

# Проверяем SSH ключ
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH key not found: $SSH_KEY"
    echo "Generate one with: ssh-keygen -t ed25519 -f ~/.ssh/makemefit_deploy"
    exit 1
fi

# Копируем код на сервер
echo "📦 Copying files to server..."
rsync -avz --delete \
  --exclude '.git' \
  --exclude 'venv' \
  --exclude '__pycache__' \
  --exclude 'node_modules' \
  --exclude '.env' \
  --exclude '*.pyc' \
  -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  ./ $DEPLOY_USER@$DEPLOY_HOST:/opt/makemefit/

# Запускаем деплой на сервере
echo "🔧 Running deployment on server..."
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST << EOF
  set -e
  
  cd /opt/makemefit
  
  # Проверяем .env
  if [ ! -f backend/.env ]; then
    echo "❌ .env file not found!"
    echo "Please create backend/.env on server first"
    exit 1
  fi
  
  # Обновляем git (если используется)
  if [ -d .git ]; then
    git fetch origin
    git checkout $BRANCH
    git reset --hard origin/$BRANCH
  fi
  
  # Останавливаем старые контейнеры
  echo "🛑 Stopping old containers..."
  cd infra
  docker-compose down || true
  
  # Собираем и запускаем
  echo "🔨 Building containers..."
  docker-compose build --no-cache
  
  echo "🚀 Starting containers..."
  docker-compose up -d
  
  # Ждем запуска
  echo "⏳ Waiting for services to start..."
  sleep 15
  
  # Проверяем health
  echo "🔍 Checking health..."
  for i in {1..10}; do
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
      echo "✅ Health check passed!"
      break
    fi
    if [ \$i -eq 10 ]; then
      echo "❌ Health check failed!"
      docker-compose logs
      exit 1
    fi
    sleep 3
  done
  
  # Миграции
  echo "📦 Running migrations..."
  docker-compose exec -T backend alembic upgrade head || echo "⚠️  Migrations skipped"
  
  echo "✅ Deployment completed!"
EOF

echo "✅ Deploy finished successfully!"
echo "🌐 Your app should be available at: http://$DEPLOY_HOST"
