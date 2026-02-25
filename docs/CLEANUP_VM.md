# Очистка VM перед деплоем

## Быстрая очистка

```bash
# Подключитесь к серверу
ssh deploy@amesin.ru

# Запустите скрипт очистки
cd /opt/makemefit
./scripts/cleanup_nginx.sh
```

## Ручная очистка

Если скрипт недоступен, выполните вручную:

```bash
# 1. Остановите Nginx
sudo systemctl stop nginx

# 2. Удалите все конфигурации сайтов
sudo rm -f /etc/nginx/sites-enabled/*
sudo rm -f /etc/nginx/sites-available/makemefit

# 3. Создайте чистую дефолтную конфигурацию
sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    root /var/www/html;
    index index.html;
    location / {
        try_files $uri $uri/ =404;
    }
}
EOF

# 4. Активируйте дефолтную конфигурацию
sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# 5. Проверьте конфигурацию
sudo nginx -t

# 6. Запустите Nginx
sudo systemctl start nginx
```

## Что сохраняется

✅ **Сохраняется:**
- Nginx (установлен и работает)
- SSL сертификаты в `/etc/letsencrypt/`
- Certbot
- Docker и Docker Compose
- Все установленное ПО

❌ **Удаляется:**
- Все конфигурации сайтов Nginx
- Связи между конфигурациями

## После очистки

1. Настройте GitHub Actions секреты
2. Создайте `.env` файл на сервере
3. Push в main → автоматический деплой создаст новую конфигурацию
