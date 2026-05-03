# Настройка VM с нуля для MakeMeFit

Полная инструкция по настройке чистой VM для деплоя MakeMeFit.

## Требования к VM

- **ОС**: Ubuntu 22.04 LTS (рекомендуется) или Debian 11+
- **RAM**: минимум 2GB (рекомендуется 4GB+)
- **CPU**: минимум 2 ядра
- **Диск**: минимум 20GB SSD
- **Публичный IP**: обязателен
- **Порты**: 22 (SSH), 80 (HTTP), 443 (HTTPS) должны быть открыты

## Шаг 1: Подключение к VM

```bash
ssh root@your-server-ip
# или
ssh user@your-server-ip
```

## Шаг 2: Обновление системы

```bash
# Обновите систему
sudo apt update
sudo apt upgrade -y

# Перезагрузите (если нужно)
sudo reboot
```

## Шаг 3: Установка базовых инструментов

```bash
sudo apt install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    nano
```

## Шаг 4: Установка Docker

```bash
# Удалите старые версии (если есть)
sudo apt remove -y docker docker-engine docker.io containerd runc

# Установите Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавьте текущего пользователя в группу docker
sudo usermod -aG docker $USER

# Примените изменения
newgrp docker

# Проверьте установку
docker --version
# Должно показать: Docker version 24.x.x или выше
```

## Шаг 5: Установка Docker Compose

```bash
# Скачайте последнюю версию Docker Compose
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Сделайте исполняемым
sudo chmod +x /usr/local/bin/docker-compose

# Проверьте
docker-compose --version
# Должно показать: Docker Compose version v2.x.x или выше
```

## Шаг 6: Установка Nginx

```bash
# Установите Nginx
sudo apt install -y nginx

# Запустите и включите автозапуск
sudo systemctl start nginx
sudo systemctl enable nginx

# Проверьте статус
sudo systemctl status nginx
```

## Шаг 7: Установка Certbot (для SSL)

```bash
# Установите Certbot
sudo apt install -y certbot python3-certbot-nginx

# Проверьте установку
certbot --version
```

## Шаг 8: Настройка Firewall

```bash
# Разрешите необходимые порты
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Включите firewall
sudo ufw --force enable

# Проверьте статус
sudo ufw status
```

## Шаг 9: Создание пользователя для деплоя (опционально, но рекомендуется)

```bash
# Создайте пользователя
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy
sudo usermod -aG sudo deploy

# Настройте SSH ключи (на вашем локальном компьютере)
# ssh-copy-id deploy@your-server-ip

# Или создайте пароль
sudo passwd deploy
```

## Шаг 10: Настройка DNS (если есть домен)

Настройте DNS записи у вашего провайдера:

```
A запись:
api.example.com → ваш-ip-адрес
app.example.com → ваш-ip-адрес
```

Подождите 5-15 минут для распространения DNS.

## Шаг 11: Клонирование репозитория

```bash
# Переключитесь на пользователя deploy (или используйте root)
sudo su - deploy
# или оставайтесь root

# Создайте директорию для проекта
sudo mkdir -p /opt/makemefit
sudo chown $USER:$USER /opt/makemefit

# Клонируйте репозиторий
cd /opt
git clone https://github.com/1DenBackyard/MakeMeFit.git makemefit
cd makemefit
```

## Шаг 12: Создание .env файла

```bash
cd /opt/makemefit/backend

# Создайте .env файл
nano .env
```

Вставьте и заполните (см. `scripts/README-ENV.md` для примеров):

```env
# App
APP_NAME=MakeMeFit API
APP_VERSION=0.1.0
DEBUG=false

# Database (для Docker Compose)
DATABASE_URL=postgresql+asyncpg://makemefit:makemefit@postgres:5432/makemefit

# Telegram (ОБЯЗАТЕЛЬНО!)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username

# LLM Provider
LLM_PROVIDER=openai
LLM_API_KEY=your_api_key
LLM_BASE_URL=https://foundation-models.api.cloud.ru/v1
LLM_MODEL=openai/gpt-oss-120b
LLM_MODEL_FULL=openai/gpt-oss-120b
LLM_STREAMING=true

# Security
SECRET_KEY=your_secret_key_min_32_chars

# Payment (можно оставить пустым для теста)
PAYMENT_PROVIDER_TOKEN=

# Rate Limiting
RATE_LIMIT_PER_MINUTE=10

# Admin
ADMIN_SECRET=your_admin_secret

# PDF Storage
PDF_STORAGE_PATH=/app/pdfs
```

**Важно:**
- `TELEGRAM_BOT_TOKEN` - получите у @BotFather в Telegram
- `TELEGRAM_BOT_USERNAME` - username бота без @
- `SECRET_KEY` - сгенерируйте: `openssl rand -hex 32`
- `LLM_API_KEY` и `LLM_BASE_URL` - ваши данные для LLM API

## Шаг 13: Запуск контейнеров

```bash
cd /opt/makemefit/infra

# Запустите контейнеры
docker-compose up -d --build

# Проверьте статус
docker-compose ps
# Все контейнеры должны быть "Up"

# Проверьте логи (если есть ошибки)
docker-compose logs
```

## Шаг 14: Проверка работоспособности

```bash
# Health check backend
curl http://localhost:8000/health
# Должно вернуть: {"status":"ok","version":"0.1.0"}

# Проверка frontend
curl http://localhost:5173
# Должно вернуть HTML страницу
```

## Шаг 15: Настройка Nginx для проксирования

### 15.1 Создание временной конфигурации (только HTTP)

Сначала создадим конфигурацию без SSL, чтобы Nginx мог запуститься:

```bash
sudo nano /etc/nginx/sites-available/makemefit
```

Вставьте следующую конфигурацию (только HTTP, без SSL):

```nginx
# Backend API (HTTP временно)
server {
    listen 80;
    server_name api.example.com;

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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}

# Frontend (HTTP временно)
server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://localhost:5173;
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
```

### 15.2 Активация конфигурации

```bash
# Удалите дефолтную конфигурацию
sudo rm /etc/nginx/sites-enabled/default

# Активируйте конфигурацию
sudo ln -s /etc/nginx/sites-available/makemefit /etc/nginx/sites-enabled/

# Проверьте конфигурацию
sudo nginx -t
# Должно быть: "syntax is ok" и "test is successful"

# Перезагрузите Nginx
sudo systemctl reload nginx
```

### 15.3 Создание SSL сертификатов (standalone режим)

**Важно**: Остановите Nginx перед созданием сертификатов в standalone режиме:

```bash
# Остановите Nginx (certbot займет порт 80)
sudo systemctl stop nginx

# Создайте сертификаты в standalone режиме
sudo certbot certonly --standalone \
    -d api.example.com \
    -d app.example.com \
    --non-interactive \
    --agree-tos \
    --email admin@example.com

# Запустите Nginx обратно
sudo systemctl start nginx
```

### 15.4 Обновление конфигурации с SSL

Теперь обновите конфигурацию, добавив SSL:

```bash
sudo nano /etc/nginx/sites-available/makemefit
```

Замените содержимое на полную конфигурацию с SSL:

```nginx
# Backend API
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}

# Frontend
server {
    listen 80;
    server_name app.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.example.com;

    ssl_certificate /etc/letsencrypt/live/app.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:5173;
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
```

**Примечание**: Если certbot создал один сертификат для обоих доменов, используйте:
- `ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;` (или путь, который показал certbot)
- `ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;`

Проверьте, какой путь использовал certbot:
```bash
sudo certbot certificates
```

### 15.5 Финальная проверка и перезагрузка

```bash
# Проверьте конфигурацию
sudo nginx -t
# Должно быть: "syntax is ok" и "test is successful"

# Перезагрузите Nginx
sudo systemctl reload nginx

# Проверьте статус
sudo systemctl status nginx
```

## Шаг 16: Финальная проверка

```bash
# Backend через HTTPS
curl https://api.example.com/health
# Должно вернуть: {"status":"ok","version":"0.1.0"}

# Frontend через HTTPS
curl -I https://app.example.com
# Должен вернуть HTTP 200 (не приветственный экран Nginx!)

# Проверка SSL сертификатов
sudo certbot certificates
```

## Шаг 17: Настройка автозапуска (опционально)

```bash
# Docker уже настроен на автозапуск
sudo systemctl enable docker

# Nginx уже настроен на автозапуск
sudo systemctl enable nginx

# Certbot автообновление уже настроен
sudo systemctl enable certbot.timer
```

## Шаг 18: Настройка Fail2ban (опционально, но рекомендуется)

```bash
# Fail2ban уже установлен, настройте базовую конфигурацию
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Проверьте статус
sudo systemctl status fail2ban
```

## Команды для обновления кода

После изменений в репозитории:

```bash
# На VM
cd /opt/makemefit
cp backend/.env /tmp/b.env
git fetch origin
git reset --hard origin/main
cp /tmp/b.env backend/.env
rm /tmp/b.env
cd infra
docker-compose up -d --build
```

## Troubleshooting

### Контейнеры не запускаются

```bash
cd /opt/makemefit/infra
docker-compose logs
# Проверьте логи на ошибки
```

### Nginx показывает приветственный экран

```bash
# Убедитесь, что дефолтная конфигурация удалена
sudo rm /etc/nginx/sites-enabled/default

# Проверьте, что ваша конфигурация активна
ls -la /etc/nginx/sites-enabled/

# Перезагрузите Nginx
sudo systemctl reload nginx
```

### SSL сертификаты не создаются

```bash
# Проверьте DNS
nslookup api.example.com
nslookup app.example.com

# Убедитесь, что порты 80 и 443 открыты
sudo ufw status

# Попробуйте создать сертификаты вручную
sudo certbot certonly --standalone -d api.example.com -d app.example.com
```

### Backend не отвечает

```bash
# Проверьте, что контейнер запущен
docker-compose ps

# Проверьте логи
docker-compose logs backend

# Проверьте порт
netstat -tlnp | grep 8000
```

## Полезные команды

```bash
# Статус всех сервисов
sudo systemctl status docker
sudo systemctl status nginx
sudo systemctl status fail2ban

# Логи контейнеров
cd /opt/makemefit/infra
docker-compose logs -f

# Перезапуск контейнеров
docker-compose restart

# Перезапуск Nginx
sudo systemctl restart nginx
```

## Готово! 🎉

Ваше приложение должно быть доступно:
- **API**: https://api.example.com
- **Frontend**: https://app.example.com

## Следующие шаги

1. Настройте Telegram бота (см. [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md))
2. Настройте GitHub Actions для автоматического деплоя (см. [AUTO_DEPLOY.md](AUTO_DEPLOY.md))
3. Протестируйте приложение через Telegram Mini App
