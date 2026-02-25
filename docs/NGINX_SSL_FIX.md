# Исправление ошибки SSL сертификатов в Nginx

Если вы видите ошибку:
```
nginx: [emerg] cannot load certificate "/etc/letsencrypt/live/api.amesin.ru/fullchain.pem": BIO_new_file() failed
```

Это означает, что в конфигурации Nginx указаны пути к сертификатам, которых еще нет.

## Быстрое исправление

### Шаг 1: Остановите Nginx

```bash
sudo systemctl stop nginx
```

### Шаг 2: Временно упростите конфигурацию (только HTTP)

```bash
sudo nano /etc/nginx/sites-available/makemefit
```

Замените содержимое на (без SSL):

```nginx
# Backend API (HTTP)
server {
    listen 80;
    server_name api.amesin.ru;

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

# Frontend (HTTP)
server {
    listen 80;
    server_name app.amesin.ru;

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

### Шаг 3: Проверьте и запустите Nginx

```bash
# Проверьте конфигурацию
sudo nginx -t

# Запустите Nginx
sudo systemctl start nginx
```

### Шаг 4: Создайте SSL сертификаты (standalone режим)

```bash
# Создайте сертификаты (Nginx должен быть остановлен)
sudo systemctl stop nginx

sudo certbot certonly --standalone \
    -d api.amesin.ru \
    -d app.amesin.ru \
    --non-interactive \
    --agree-tos \
    --email admin@amesin.ru

# Проверьте, где созданы сертификаты
sudo certbot certificates
```

### Шаг 5: Обновите конфигурацию с SSL

```bash
sudo nano /etc/nginx/sites-available/makemefit
```

Замените на полную конфигурацию с SSL. **Важно**: Используйте правильные пути к сертификатам из вывода `certbot certificates`.

Если certbot создал один сертификат для обоих доменов, используйте:

```nginx
# Backend API
server {
    listen 80;
    server_name api.amesin.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.amesin.ru;

    # Используйте путь, который показал certbot certificates
    ssl_certificate /etc/letsencrypt/live/api.amesin.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.amesin.ru/privkey.pem;
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
    server_name app.amesin.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.amesin.ru;

    # Используйте тот же путь, что и для API (если один сертификат)
    ssl_certificate /etc/letsencrypt/live/api.amesin.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.amesin.ru/privkey.pem;
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

### Шаг 6: Финальная проверка

```bash
# Проверьте конфигурацию
sudo nginx -t

# Запустите Nginx
sudo systemctl start nginx

# Проверьте статус
sudo systemctl status nginx
```

### Шаг 7: Проверка работы

```bash
# Backend
curl https://api.amesin.ru/health

# Frontend
curl -I https://app.amesin.ru
```

## Альтернативный способ: один сертификат для обоих доменов

Если certbot создал один сертификат для обоих доменов (что часто бывает), используйте один путь для обоих:

```bash
# Проверьте пути
sudo certbot certificates
```

Используйте путь, который показан в выводе (обычно это `/etc/letsencrypt/live/api.amesin.ru/` или `/etc/letsencrypt/live/app.amesin.ru/`).

## Troubleshooting

### Certbot не может создать сертификаты

```bash
# Проверьте DNS
nslookup api.amesin.ru
nslookup app.amesin.ru

# Убедитесь, что порты открыты
sudo ufw status

# Проверьте, что Nginx остановлен перед созданием сертификатов
sudo systemctl stop nginx
```

### Nginx все еще не запускается

```bash
# Проверьте логи
sudo tail -f /var/log/nginx/error.log

# Проверьте конфигурацию
sudo nginx -t -v
```

### Сертификаты созданы, но пути не совпадают

```bash
# Найдите реальные пути
sudo ls -la /etc/letsencrypt/live/

# Обновите конфигурацию с правильными путями
sudo nano /etc/nginx/sites-available/makemefit
```
