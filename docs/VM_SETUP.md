# Подготовка VM и установка SSL сертификатов

## Требования к VM

- **ОС:** Ubuntu 22.04 LTS (рекомендуется) или Debian 11+
- **RAM:** минимум 2GB (рекомендуется 4GB+)
- **CPU:** минимум 2 ядра
- **Диск:** минимум 20GB SSD
- **Публичный IP:** обязателен
- **Порты:** 22 (SSH), 80 (HTTP), 443 (HTTPS) должны быть открыты

## Шаг 1: Первоначальная настройка VM

### 1.1 Подключение к серверу

```bash
ssh root@your-server-ip
# или
ssh user@your-server-ip
```

### 1.2 Обновление системы

```bash
# Обновите систему
sudo apt update
sudo apt upgrade -y

# Перезагрузите (если нужно)
sudo reboot
```

### 1.3 Установка базовых инструментов

```bash
# Установите необходимые пакеты
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
    fail2ban
```

## Шаг 2: Установка Docker и Docker Compose

### 2.1 Установка Docker

```bash
# Удалите старые версии (если есть)
sudo apt remove -y docker docker-engine docker.io containerd runc

# Установите Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавьте текущего пользователя в группу docker
sudo usermod -aG docker $USER

# Примените изменения (перелогиньтесь или выполните)
newgrp docker

# Проверьте установку
docker --version
```

### 2.2 Установка Docker Compose

```bash
# Скачайте последнюю версию Docker Compose
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Сделайте исполняемым
sudo chmod +x /usr/local/bin/docker-compose

# Проверьте
docker-compose --version
```

## Шаг 3: Установка Nginx

```bash
# Установите Nginx
sudo apt install -y nginx

# Запустите и включите автозапуск
sudo systemctl start nginx
sudo systemctl enable nginx

# Проверьте статус
sudo systemctl status nginx
```

## Шаг 4: Установка Certbot для SSL сертификатов

### 4.1 Установка Certbot

```bash
# Установите Certbot и плагин для Nginx
sudo apt install -y certbot python3-certbot-nginx

# Проверьте установку
certbot --version
```

### 4.2 Настройка автообновления сертификатов

```bash
# Проверьте, что автообновление работает
sudo certbot renew --dry-run

# Настройте cron для автоматического обновления (обычно уже настроено)
sudo systemctl status certbot.timer
```

## Шаг 5: Настройка Firewall

### 5.1 Базовая настройка UFW

```bash
# Разрешите SSH (важно сделать первым!)
sudo ufw allow 22/tcp

# Разрешите HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включите firewall
sudo ufw enable

# Проверьте статус
sudo ufw status verbose
```

### 5.2 Настройка Fail2ban (защита от брутфорса)

```bash
# Fail2ban уже установлен на шаге 1.3
# Настройте для SSH
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Проверьте статус
sudo systemctl status fail2ban

# Проверьте логи
sudo fail2ban-client status sshd
```

## Шаг 6: Создание пользователя для деплоя

### 6.1 Создание пользователя

```bash
# Создайте пользователя
sudo useradd -m -s /bin/bash deploy

# Добавьте в группу docker
sudo usermod -aG docker deploy

# Добавьте в группу sudo (опционально, для удобства)
sudo usermod -aG sudo deploy

# Создайте директорию для проекта
sudo mkdir -p /opt/makemefit
sudo chown deploy:deploy /opt/makemefit
```

### 6.2 Настройка SSH для деплоя

```bash
# Переключитесь на пользователя deploy
sudo su - deploy

# Создайте директорию для SSH ключей
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Выйдите из сессии deploy
exit
```

**На вашем локальном компьютере:**

```bash
# Сгенерируйте SSH ключ (если еще нет)
ssh-keygen -t ed25519 -C "deploy@makemefit" -f ~/.ssh/makemefit_deploy

# Скопируйте публичный ключ на сервер
ssh-copy-id -i ~/.ssh/makemefit_deploy.pub deploy@your-server-ip

# Или вручную
cat ~/.ssh/makemefit_deploy.pub | ssh deploy@your-server-ip "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**Вернитесь на сервер и настройте права:**

```bash
# На сервере
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown deploy:deploy /home/deploy/.ssh/authorized_keys
sudo chown deploy:deploy /home/deploy/.ssh
```

## Шаг 7: Настройка домена (если есть)

### 7.1 Настройка DNS записей

Если у вас есть домен, настройте DNS:

```
A запись:
api.your-domain.com → ваш-ip-адрес
app.your-domain.com → ваш-ip-адрес

Или если один домен:
your-domain.com → ваш-ip-адрес
```

### 7.2 Проверка DNS

```bash
# Проверьте, что DNS записи работают
dig api.your-domain.com
nslookup api.your-domain.com
```

## Шаг 8: Получение SSL сертификатов

### 8.1 Вариант A: С доменом (рекомендуется)

```bash
# Получите сертификат для API
sudo certbot --nginx -d api.your-domain.com

# Получите сертификат для Frontend
sudo certbot --nginx -d app.your-domain.com

# Или для одного домена
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot автоматически:
- Создаст SSL сертификат
- Настроит Nginx для использования HTTPS
- Настроит редирект с HTTP на HTTPS

### 8.2 Вариант B: Без домена (только IP)

Если у вас нет домена, можно использовать самоподписанный сертификат:

```bash
# Создайте директорию для сертификатов
sudo mkdir -p /etc/nginx/ssl

# Создайте самоподписанный сертификат
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx.key \
  -out /etc/nginx/ssl/nginx.crt \
  -subj "/C=RU/ST=State/L=City/O=Organization/CN=your-server-ip"

# Установите правильные права
sudo chmod 600 /etc/nginx/ssl/nginx.key
sudo chmod 644 /etc/nginx/ssl/nginx.crt
```

**⚠️ Внимание:** Самоподписанные сертификаты будут показывать предупреждение в браузере. Для продакшена рекомендуется использовать домен с Let's Encrypt.

## Шаг 9: Настройка Nginx для приложения

### 9.1 Создание конфигурации

```bash
sudo nano /etc/nginx/sites-available/makemefit
```

Добавьте конфигурацию:

**Если есть домен с SSL:**

```nginx
# Backend API
server {
    listen 80;
    server_name api.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;
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
    server_name app.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/app.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

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

**Если нет домена (только IP с самоподписанным сертификатом):**

```nginx
# Backend API
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name _;

    ssl_certificate /etc/nginx/ssl/nginx.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx.key;
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
    }
}
```

### 9.2 Активация конфигурации

```bash
# Создайте симлинк
sudo ln -s /etc/nginx/sites-available/makemefit /etc/nginx/sites-enabled/

# Удалите дефолтную конфигурацию (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверьте конфигурацию
sudo nginx -t

# Перезагрузите Nginx
sudo systemctl reload nginx
```

## Шаг 10: Финальная проверка

### 10.1 Проверка сервисов

```bash
# Проверьте статус всех сервисов
sudo systemctl status docker
sudo systemctl status nginx
sudo systemctl status fail2ban

# Проверьте порты
sudo netstat -tlnp | grep -E ':(80|443|22)'
```

### 10.2 Проверка SSL сертификата

```bash
# Если есть домен
curl -I https://api.amesin.ru/health

# Проверьте срок действия сертификата
sudo certbot certificates
```

### 10.3 Тест подключения

```bash
# С вашего локального компьютера
curl http://your-server-ip/health
# или
curl https://api.your-domain.com/health
```

## Шаг 11: Настройка мониторинга (опционально)

### 11.1 Настройка логирования

```bash
# Настройте ротацию логов
sudo nano /etc/logrotate.d/nginx

# Добавьте:
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

### 11.2 Настройка автоматических обновлений

```bash
# Настройте автоматические обновления безопасности
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Чеклист готовности VM

- [ ] Система обновлена
- [ ] Docker установлен и работает
- [ ] Docker Compose установлен
- [ ] Nginx установлен и настроен
- [ ] Certbot установлен
- [ ] Firewall настроен (UFW)
- [ ] Fail2ban настроен
- [ ] Пользователь deploy создан
- [ ] SSH ключи настроены
- [ ] SSL сертификаты получены (или самоподписанные)
- [ ] Nginx конфигурация создана и активирована
- [ ] Все сервисы запущены
- [ ] Порты открыты и доступны

## Следующие шаги

После подготовки VM:

1. **Создайте .env файл** на сервере:
   ```bash
   ssh deploy@your-server-ip
   cd /opt/makemefit/backend
   nano .env
   ```

2. **Настройте GitHub Actions** (см. [AUTO_DEPLOY.md](AUTO_DEPLOY.md))

3. **Запустите первый деплой**

## Troubleshooting

### Проблемы с SSL

```bash
# Проверьте сертификаты
sudo certbot certificates

# Обновите вручную
sudo certbot renew

# Проверьте логи
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### Проблемы с Nginx

```bash
# Проверьте конфигурацию
sudo nginx -t

# Проверьте логи
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Проблемы с Docker

```bash
# Проверьте статус
sudo systemctl status docker

# Проверьте логи
sudo journalctl -u docker -f
```

## Полезные команды

```bash
# Перезапуск сервисов
sudo systemctl restart nginx
sudo systemctl restart docker

# Просмотр логов
sudo journalctl -u nginx -f
sudo docker-compose -f /opt/makemefit/infra/docker-compose.yml logs -f

# Проверка использования ресурсов
htop
df -h
free -h
```

Готово! Ваша VM подготовлена для хостинга приложения.
