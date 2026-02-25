#!/bin/bash
# Скрипт для очистки Nginx конфигураций (оставляет только софт и сертификаты)

set -e

echo "🧹 Очистка Nginx конфигураций..."

# Останавливаем Nginx
echo "🛑 Останавливаем Nginx..."
sudo systemctl stop nginx

# Удаляем все конфигурации сайтов (кроме дефолтной)
echo "🗑️  Удаляем конфигурации сайтов..."
sudo rm -f /etc/nginx/sites-enabled/*
sudo rm -f /etc/nginx/sites-available/makemefit
sudo rm -f /etc/nginx/sites-available/default

# Восстанавливаем дефолтную конфигурацию (чистую)
echo "📝 Создаем чистую дефолтную конфигурацию..."
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

# Активируем дефолтную конфигурацию
sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Проверяем конфигурацию
echo "🔍 Проверяем конфигурацию Nginx..."
sudo nginx -t

# Запускаем Nginx
echo "🚀 Запускаем Nginx..."
sudo systemctl start nginx

echo "✅ Очистка завершена!"
echo ""
echo "📋 Что осталось:"
echo "  ✅ Nginx установлен и работает"
echo "  ✅ SSL сертификаты сохранены в /etc/letsencrypt/"
echo "  ✅ Certbot установлен"
echo ""
echo "📝 Следующие шаги:"
echo "  1. Настройте деплой через GitHub Actions"
echo "  2. При деплое будет создана новая конфигурация Nginx"
echo "  3. SSL сертификаты будут использованы автоматически"
