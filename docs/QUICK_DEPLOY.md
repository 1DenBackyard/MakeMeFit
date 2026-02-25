# Быстрый деплой на VM

## Самый простой способ (5 минут)

### 1. Подключитесь к серверу

```bash
ssh user@your-server-ip
```

### 2. Установите Docker (если нет)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Клонируйте репозиторий

```bash
cd /opt
git clone https://github.com/your-username/MakeMeFit.git
cd MakeMeFit
```

### 4. Настройте .env

```bash
cd backend
nano .env
```

Заполните минимум:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_BOT_USERNAME`
- `LLM_API_KEY`
- `LLM_BASE_URL`
- `SECRET_KEY`

### 5. Запустите

```bash
cd ../infra
docker-compose up -d
```

### 6. Проверьте

```bash
curl http://localhost:8000/health
# Должно вернуть: {"status":"ok","version":"0.1.0"}
```

### 7. Настройте Nginx (для доступа по IP)

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/default
```

Замените содержимое на:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Откройте firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Готово!

Ваше приложение доступно по:
- `http://your-server-ip/health` - health check
- `http://your-server-ip/docs` - API документация

## Для Telegram Mini App

1. Используйте ngrok для HTTPS (или настройте домен с SSL)
2. Обновите URL в BotFather на ваш ngrok URL или домен

Подробнее: [DEPLOY_VM.md](DEPLOY_VM.md)
