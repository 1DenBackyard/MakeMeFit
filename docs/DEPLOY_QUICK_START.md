# Быстрый старт: Автоматический деплой

## За 5 минут

### 1. Подготовьте сервер (один раз)

```bash
# Подключитесь к серверу
ssh root@your-server-ip

# Установите Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh

# Установите Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Создайте пользователя
useradd -m -s /bin/bash deploy
usermod -aG docker deploy
mkdir -p /opt/makemefit
chown deploy:deploy /opt/makemefit
```

### 2. Настройте SSH ключ

**На вашем компьютере:**

```bash
# Сгенерируйте ключ
ssh-keygen -t ed25519 -f ~/.ssh/makemefit_deploy

# Скопируйте на сервер
ssh-copy-id -i ~/.ssh/makemefit_deploy.pub deploy@your-server-ip
```

### 3. Добавьте секреты в GitHub

В репозитории: **Settings → Secrets and variables → Actions**

Добавьте:
- `DEPLOY_HOST` = `your-server-ip`
- `DEPLOY_USER` = `deploy`
- `DEPLOY_SSH_KEY` = содержимое `~/.ssh/makemefit_deploy` (приватный ключ)

### 4. Создайте .env на сервере

```bash
ssh deploy@your-server-ip
cd /opt/makemefit/backend
nano .env
# Заполните все значения
```

### 5. Push в main

```bash
git push origin main
```

**Готово!** GitHub Actions автоматически задеплоит на ваш сервер.

## Ручной деплой (если нужно)

```bash
# Установите переменные
export DEPLOY_HOST=your-server-ip
export DEPLOY_USER=deploy
export SSH_KEY=~/.ssh/makemefit_deploy

# Запустите деплой
make deploy

# Или напрямую
./scripts/deploy.sh
```

## Проверка

```bash
# Health check
curl http://your-server-ip:8000/health

# Или через Nginx (если настроен)
curl http://your-server-ip/health
```

Подробнее: [AUTO_DEPLOY.md](AUTO_DEPLOY.md)
