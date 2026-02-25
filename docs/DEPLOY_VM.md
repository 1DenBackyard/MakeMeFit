# Деплой на VM с публичным IP

## Подготовка VM

### Требования к серверу

- **ОС:** Ubuntu 22.04 LTS или Debian 11+ (рекомендуется)
- **RAM:** минимум 2GB (рекомендуется 4GB+)
- **CPU:** минимум 2 ядра
- **Диск:** минимум 20GB
- **Публичный IP:** обязателен
- **Порты:** 80, 443 (для веб), 22 (SSH)

### 1. Подключение к серверу

```bash
ssh user@your-server-ip
```

### 2. Обновление системы

```bash
sudo apt update
sudo apt upgrade -y
```

### 3. Установка базовых инструментов

```bash
sudo apt install -y \
    git \
    curl \
    wget \
    build-essential \
    python3.11 \
    python3.11-venv \
    python3-pip \
    nginx \
    certbot \
    python3-certbot-nginx \
    postgresql \
    postgresql-contrib \
    docker.io \
    docker-compose
```

### 4. Настройка Docker (опционально, но рекомендуется)

```bash
# Добавьте пользователя в группу docker
sudo usermod -aG docker $USER

# Перелогиньтесь или выполните
newgrp docker

# Проверьте
docker --version
```

## Вариант 1: Деплой через Docker (рекомендуется)

### 1. Клонируйте репозиторий

```bash
cd /opt
sudo git clone https://github.com/1Denbackyard/MakeMeFit.git
sudo chown -R $USER:$USER MakeMeFit
cd MakeMeFit
```

### 2. Настройте переменные окружения

```bash
cd backend
cp .env.example .env
nano .env  # или vi .env
```

Заполните:
```env
# App
APP_NAME=MakeMeFit API
APP_VERSION=0.1.0
DEBUG=false

# Database (используйте Docker PostgreSQL)
DATABASE_URL=postgresql+asyncpg://makemefit:makemefit@postgres:5432/makemefit

# Telegram
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_BOT_USERNAME=your_bot_username

# LLM
LLM_PROVIDER=openai
LLM_API_KEY=your_key
LLM_BASE_URL=https://foundation-models.api.cloud.ru/v1
LLM_MODEL=openai/gpt-oss-120b
LLM_MODEL_FULL=openai/gpt-oss-120b
LLM_STREAMING=true

# Security
SECRET_KEY=your_secret_key_min_32_chars
RATE_LIMIT_PER_MINUTE=10

# Admin
ADMIN_SECRET=your_admin_secret

# PDF Storage
PDF_STORAGE_PATH=/app/pdfs
```

### 3. Настройте docker-compose

```bash
cd infra
nano docker-compose.yml  # проверьте настройки
```

### 4. Запустите через Docker

```bash
cd infra
docker-compose up -d

# Проверьте логи
docker-compose logs -f
```

### 5. Настройте Nginx как reverse proxy

```bash
sudo nano /etc/nginx/sites-available/makemefit
```

Добавьте:

```nginx
# Backend API
server {
    listen 80;
    server_name your-domain.com api.your-domain.com;

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

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/makemefit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Настройте SSL (Let's Encrypt)

```bash
# Для backend API
sudo certbot --nginx -d api.your-domain.com

# Для frontend
sudo certbot --nginx -d app.your-domain.com

# Автообновление
sudo certbot renew --dry-run
```

## Вариант 2: Деплой без Docker (напрямую)

### 1. Установите Python и зависимости

```bash
# Python уже установлен на шаге 3
python3.11 --version

# Создайте venv
cd /opt/MakeMeFit/backend
python3.11 -m venv venv
source venv/bin/activate

# Установите зависимости
pip install --upgrade pip
pip install -r requirements.txt
```

### 2. Настройте PostgreSQL

```bash
# Создайте пользователя и БД
sudo -u postgres psql

# В psql:
CREATE USER makemefit WITH PASSWORD 'your_secure_password';
CREATE DATABASE makemefit OWNER makemefit;
GRANT ALL PRIVILEGES ON DATABASE makemefit TO makemefit;
\q
```

Обновите `DATABASE_URL` в `.env`:
```env
DATABASE_URL=postgresql+asyncpg://makemefit:your_secure_password@localhost:5432/makemefit
```

### 3. Примените миграции

```bash
cd /opt/MakeMeFit/backend
source venv/bin/activate
alembic upgrade head
python scripts/seed.py
```

### 4. Создайте systemd service

```bash
sudo nano /etc/systemd/system/makemefit-backend.service
```

Добавьте:

```ini
[Unit]
Description=MakeMeFit Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=your-username
WorkingDirectory=/opt/MakeMeFit/backend
Environment="PATH=/opt/MakeMeFit/backend/venv/bin"
ExecStart=/opt/MakeMeFit/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Активируйте:

```bash
sudo systemctl daemon-reload
sudo systemctl enable makemefit-backend
sudo systemctl start makemefit-backend
sudo systemctl status makemefit-backend
```

### 5. Настройте Nginx

```bash
sudo nano /etc/nginx/sites-available/makemefit
```

Добавьте конфигурацию (как в Варианте 1, шаг 5)

## Настройка Frontend

### 1. Установите Node.js

```bash
# Установите Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Проверьте
node --version
npm --version
```

### 2. Соберите Frontend

```bash
cd /opt/MakeMeFit/frontend

# Установите зависимости
npm install

# Создайте .env
echo "VITE_API_URL=https://api.your-domain.com" > .env

# Соберите для продакшена
npm run build
```

### 3. Настройте Nginx для статики

```bash
sudo nano /etc/nginx/sites-available/makemefit-frontend
```

Добавьте:

```nginx
server {
    listen 80;
    server_name app.your-domain.com;

    root /opt/MakeMeFit/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Или используйте PM2 для dev режима:

```bash
npm install -g pm2
pm2 serve /opt/MakeMeFit/frontend/dist 5173 --name makemefit-frontend
pm2 save
pm2 startup
```

## Настройка Firewall

```bash
# Разрешите необходимые порты
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Проверьте статус
sudo ufw status
```

## Обновление приложения

### Через Docker

```bash
cd /opt/MakeMeFit
git pull
cd infra
docker-compose down
docker-compose build
docker-compose up -d
```

### Без Docker

```bash
cd /opt/MakeMeFit
git pull

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
sudo systemctl restart makemefit-backend

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart makemefit-frontend  # или перезапустите nginx
```

## Мониторинг и логи

### Просмотр логов

```bash
# Docker
docker-compose logs -f

# Systemd
sudo journalctl -u makemefit-backend -f

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Проверка статуса

```bash
# Backend
curl http://localhost:8000/health

# Или через публичный IP
curl http://your-server-ip:8000/health
```

## Настройка домена (опционально)

### 1. Настройте DNS

Добавьте A-записи:
- `api.your-domain.com` → ваш IP
- `app.your-domain.com` → ваш IP

### 2. Обновите Nginx конфигурацию

Используйте домены вместо IP в конфигурации Nginx

### 3. Получите SSL сертификаты

```bash
sudo certbot --nginx -d api.your-domain.com -d app.your-domain.com
```

## Безопасность

### 1. Настройте SSH ключи

```bash
# На вашем компьютере
ssh-copy-id user@your-server-ip

# Отключите парольную аутентификацию (опционально)
sudo nano /etc/ssh/sshd_config
# Установите: PasswordAuthentication no
sudo systemctl restart sshd
```

### 2. Настройте fail2ban

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Регулярные обновления

```bash
# Настройте автоматические обновления безопасности
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Troubleshooting

### Сервер не отвечает

```bash
# Проверьте, запущен ли сервис
sudo systemctl status makemefit-backend

# Проверьте порты
sudo netstat -tlnp | grep 8000

# Проверьте логи
sudo journalctl -u makemefit-backend -n 50
```

### Ошибки подключения к БД

```bash
# Проверьте PostgreSQL
sudo systemctl status postgresql

# Проверьте подключение
psql -h localhost -U makemefit -d makemefit
```

### Nginx ошибки

```bash
# Проверьте конфигурацию
sudo nginx -t

# Перезапустите
sudo systemctl restart nginx

# Проверьте логи
sudo tail -f /var/log/nginx/error.log
```

## Быстрая команда для деплоя

```bash
# 1. Подключитесь к серверу
ssh user@your-server-ip

# 2. Клонируйте репозиторий
cd /opt && git clone https://github.com/your-username/MakeMeFit.git

# 3. Настройте .env
cd MakeMeFit/backend && nano .env

# 4. Запустите через Docker
cd ../infra && docker-compose up -d

# 5. Настройте Nginx
sudo nano /etc/nginx/sites-available/makemefit
# (скопируйте конфигурацию выше)

# 6. Активируйте и перезапустите
sudo ln -s /etc/nginx/sites-available/makemefit /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 7. Получите SSL
sudo certbot --nginx -d your-domain.com
```

Готово! Ваше приложение доступно по IP или домену.
