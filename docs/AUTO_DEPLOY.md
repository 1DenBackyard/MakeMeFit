# Автоматический деплой на VM с публичным IP

## Архитектура

1. **GitHub Actions** (или другой CI/CD) → автоматически деплоит при push
2. **VM с публичным IP** → принимает деплой через SSH
3. **Docker** → контейнеризация для простоты
4. **Nginx** → reverse proxy и SSL

## Подготовка VM

### 1. Создайте VM

**Требования:**
- Ubuntu 22.04 LTS или Debian 11+
- Минимум 2GB RAM, 2 CPU, 20GB диск
- Публичный IP адрес
- Открытые порты: 22 (SSH), 80 (HTTP), 443 (HTTPS)

### 2. Настройте сервер

```bash
# Подключитесь к серверу
ssh root@your-server-ip

# Обновите систему
apt update && apt upgrade -y

# Установите Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установите Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Установите Nginx
apt install -y nginx certbot python3-certbot-nginx

# Создайте пользователя для деплоя
useradd -m -s /bin/bash deploy
usermod -aG docker deploy
mkdir -p /home/deploy/.ssh
```

### 3. Настройте SSH ключи для деплоя

**На вашем локальном компьютере:**

```bash
# Сгенерируйте SSH ключ (если нет)
ssh-keygen -t ed25519 -C "deploy@makemefit" -f ~/.ssh/makemefit_deploy

# Скопируйте публичный ключ на сервер
ssh-copy-id -i ~/.ssh/makemefit_deploy.pub deploy@your-server-ip

# Или вручную
cat ~/.ssh/makemefit_deploy.pub | ssh deploy@your-server-ip "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**На сервере:**

```bash
# Убедитесь, что права правильные
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
```

### 4. Настройте директории на сервере

```bash
# Создайте директорию для приложения
mkdir -p /opt/makemefit
chown deploy:deploy /opt/makemefit

# Создайте директорию для .env
mkdir -p /opt/makemefit/secrets
chmod 700 /opt/makemefit/secrets
```

## Настройка GitHub Actions

### 1. Создайте секреты в GitHub

В репозитории: **Settings → Secrets and variables → Actions**

Добавьте:
- `DEPLOY_HOST` - IP адрес или домен сервера
- `DEPLOY_USER` - пользователь для деплоя (обычно `deploy`)
- `DEPLOY_SSH_KEY` - приватный SSH ключ (содержимое `~/.ssh/makemefit_deploy`)
- `DEPLOY_SSH_PASSPHRASE` - пароль от SSH ключа (если есть)

### 2. Создайте workflow файл

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VM

on:
  push:
    branches: [main, master]
  workflow_dispatch:  # Позволяет запускать вручную

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.DEPLOY_SSH_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H ${{ secrets.DEPLOY_HOST }} >> ~/.ssh/known_hosts
      
      - name: Deploy to server
        env:
          DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}
          DEPLOY_USER: ${{ secrets.DEPLOY_USER }}
        run: |
          ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no ${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }} << 'EOF'
            set -e
            
            echo "🚀 Starting deployment..."
            
            # Переходим в директорию проекта
            cd /opt/makemefit || git clone https://github.com/YOUR_USERNAME/MakeMeFit.git /opt/makemefit
            cd /opt/makemefit
            
            # Обновляем код
            git fetch origin
            git reset --hard origin/main
            
            # Копируем .env если его нет
            if [ ! -f backend/.env ]; then
              echo "⚠️  .env file not found. Please create it manually."
              echo "Copy from backend/.env.example and fill in values."
              exit 1
            fi
            
            # Останавливаем старые контейнеры
            cd infra
            docker-compose down || true
            
            # Собираем и запускаем новые контейнеры
            docker-compose build --no-cache
            docker-compose up -d
            
            # Ждем запуска
            sleep 10
            
            # Проверяем health
            curl -f http://localhost:8000/health || exit 1
            
            # Применяем миграции
            docker-compose exec -T backend alembic upgrade head || true
            
            echo "✅ Deployment completed!"
          EOF
      
      - name: Cleanup
        if: always()
        run: |
          rm -f ~/.ssh/deploy_key
```

## Альтернатива: Скрипт деплоя

Создайте `scripts/deploy.sh` для ручного деплоя:

```bash
#!/bin/bash
set -e

# Конфигурация
DEPLOY_HOST="${DEPLOY_HOST:-your-server-ip}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
SSH_KEY="${SSH_KEY:-~/.ssh/makemefit_deploy}"

echo "🚀 Deploying to $DEPLOY_USER@$DEPLOY_HOST..."

# Копируем код на сервер
rsync -avz --exclude '.git' --exclude 'venv' --exclude '__pycache__' \
  -e "ssh -i $SSH_KEY" \
  ./ $DEPLOY_USER@$DEPLOY_HOST:/opt/makemefit/

# Запускаем деплой на сервере
ssh -i $SSH_KEY $DEPLOY_USER@$DEPLOY_HOST << 'EOF'
  set -e
  cd /opt/makemefit
  
  # Проверяем .env
  if [ ! -f backend/.env ]; then
    echo "❌ .env file not found!"
    exit 1
  fi
  
  # Останавливаем старые контейнеры
  cd infra
  docker-compose down || true
  
  # Собираем и запускаем
  docker-compose build --no-cache
  docker-compose up -d
  
  # Ждем запуска
  sleep 10
  
  # Проверяем health
  curl -f http://localhost:8000/health || exit 1
  
  # Миграции
  docker-compose exec -T backend alembic upgrade head || true
  
  echo "✅ Deployment completed!"
EOF

echo "✅ Deploy finished!"
```

Использование:
```bash
chmod +x scripts/deploy.sh
DEPLOY_HOST=your-server-ip ./scripts/deploy.sh
```

## Настройка Nginx на сервере

### 1. Создайте конфигурацию

```bash
sudo nano /etc/nginx/sites-available/makemefit
```

Добавьте:

```nginx
# Backend API
server {
    listen 80;
    server_name api.your-domain.com your-server-ip;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name app.your-domain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Активируйте и перезапустите

```bash
sudo ln -s /etc/nginx/sites-available/makemefit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Настройте SSL (опционально, но рекомендуется)

```bash
# Если есть домен
sudo certbot --nginx -d api.your-domain.com -d app.your-domain.com

# Автообновление
sudo certbot renew --dry-run
```

## Первоначальная настройка .env

**Важно:** `.env` файл НЕ должен быть в git!

### На сервере создайте .env вручную:

```bash
ssh deploy@your-server-ip
cd /opt/makemefit/backend
nano .env
```

Заполните все необходимые значения (см. `scripts/README-ENV.md`)

## Автоматизация через Makefile

Создайте `Makefile`:

```makefile
.PHONY: deploy deploy-staging deploy-prod

DEPLOY_HOST ?= your-server-ip
DEPLOY_USER ?= deploy
SSH_KEY ?= ~/.ssh/makemefit_deploy

deploy:
	@echo "🚀 Deploying to $(DEPLOY_USER)@$(DEPLOY_HOST)..."
	@rsync -avz --exclude '.git' --exclude 'venv' --exclude '__pycache__' \
		-e "ssh -i $(SSH_KEY)" \
		./ $(DEPLOY_USER)@$(DEPLOY_HOST):/opt/makemefit/
	@ssh -i $(SSH_KEY) $(DEPLOY_USER)@$(DEPLOY_HOST) 'cd /opt/makemefit/infra && docker-compose down && docker-compose build --no-cache && docker-compose up -d'
	@echo "✅ Deploy completed!"

deploy-staging:
	$(MAKE) deploy DEPLOY_HOST=staging.your-domain.com

deploy-prod:
	$(MAKE) deploy DEPLOY_HOST=your-domain.com
```

Использование:
```bash
make deploy
# или
make deploy DEPLOY_HOST=your-server-ip
```

## Мониторинг деплоя

### Проверка статуса

```bash
# На сервере
docker ps
docker-compose logs -f

# Health check
curl http://localhost:8000/health
```

### Логи GitHub Actions

В репозитории: **Actions** → выберите workflow → посмотрите логи

## Rollback (откат)

Если что-то пошло не так:

```bash
ssh deploy@your-server-ip
cd /opt/makemefit
git checkout <previous-commit>
cd infra
docker-compose down
docker-compose up -d
```

## Полная автоматизация

### 1. GitHub Actions + автоматический деплой

Workflow автоматически:
- ✅ Запускается при push в main
- ✅ Клонирует код на сервер
- ✅ Собирает Docker образы
- ✅ Запускает контейнеры
- ✅ Проверяет health
- ✅ Применяет миграции

### 2. Уведомления (опционально)

Добавьте в workflow:

```yaml
- name: Notify on success
  if: success()
  run: |
    # Отправьте уведомление в Telegram/Slack/etc
    curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
      -d "chat_id=$CHAT_ID&text=✅ Deployment successful!"
```

## Troubleshooting

### "Permission denied" при SSH

```bash
# Проверьте права на ключ
chmod 600 ~/.ssh/makemefit_deploy

# Проверьте, что ключ добавлен на сервер
ssh -i ~/.ssh/makemefit_deploy deploy@your-server-ip
```

### Docker не запускается

```bash
# На сервере проверьте логи
docker-compose logs

# Проверьте .env файл
cat backend/.env
```

### Nginx не проксирует

```bash
# Проверьте конфигурацию
sudo nginx -t

# Проверьте логи
sudo tail -f /var/log/nginx/error.log
```

## Быстрый старт

1. **Настройте сервер** (один раз)
2. **Добавьте секреты в GitHub**
3. **Создайте `.github/workflows/deploy.yml`**
4. **Push в main** → автоматический деплой! 🚀

Готово! Теперь каждый push в main автоматически деплоится на ваш сервер.
