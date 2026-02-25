# Деплой на VM с доменом amesin.ru

## Подготовка VM (если еще не сделано)

### 1. Очистка текущих настроек Nginx

```bash
# На сервере
ssh deploy@your-server-ip

# Запустите скрипт очистки
cd /opt/makemefit
./scripts/cleanup_nginx.sh

# Или вручную:
sudo systemctl stop nginx
sudo rm -f /etc/nginx/sites-enabled/*
sudo rm -f /etc/nginx/sites-available/makemefit
```

### 2. Проверка SSL сертификатов

```bash
# Проверьте существующие сертификаты
sudo certbot certificates

# Если сертификаты для amesin.ru есть, они будут использованы
# Если нет - будут созданы автоматически при деплое
```

## Настройка GitHub Actions

### 1. Добавьте секреты в GitHub

В репозитории: **Settings → Secrets and variables → Actions**

Добавьте:
- `DEPLOY_HOST` = `amesin.ru` (или IP сервера)
- `DEPLOY_USER` = `deploy`
- `DEPLOY_SSH_KEY` = содержимое приватного SSH ключа
- `DOMAIN_API` = `api.amesin.ru` (опционально, для поддомена)
- `DOMAIN_APP` = `app.amesin.ru` (опционально, для поддомена)

### 2. Обновите workflow

Файл `.github/workflows/deploy.yml` уже настроен. Проверьте, что он использует правильные переменные.

## Настройка DNS

### Вариант 1: Поддомены (рекомендуется)

Настройте DNS записи:

```
A запись:
api.amesin.ru → ваш-ip-адрес
app.amesin.ru → ваш-ip-адрес
```

### Вариант 2: Один домен

Если хотите использовать один домен:

```
A запись:
amesin.ru → ваш-ip-адрес
```

## Автоматический деплой

### Первый деплой

1. **Убедитесь, что на сервере создан .env файл:**

```bash
ssh deploy@amesin.ru
cd /opt/makemefit/backend
nano .env
# Заполните все значения
```

2. **Push в main:**

```bash
git add .
git commit -m "Initial deployment setup"
git push origin main
```

GitHub Actions автоматически:
- Подключится к серверу
- Обновит код
- Соберет Docker образы
- Запустит контейнеры
- Настроит Nginx
- Получит/обновит SSL сертификаты

### Проверка деплоя

```bash
# Health check
curl https://api.amesin.ru/health

# Или если один домен
curl https://amesin.ru/api/health
```

## Ручной деплой (если нужно)

```bash
# На вашем компьютере
export DEPLOY_HOST=amesin.ru
export DEPLOY_USER=deploy
export SSH_KEY=~/.ssh/makemefit_deploy

# Запустите деплой
make deploy
```

## Настройка Nginx при деплое

При деплое автоматически создается конфигурация Nginx:

**Для поддоменов:**
- `api.amesin.ru` → backend (порт 8000)
- `app.amesin.ru` → frontend (порт 5173)

**Для одного домена:**
- `amesin.ru/api` → backend
- `amesin.ru` → frontend

## Обновление SSL сертификатов

Сертификаты обновляются автоматически через Certbot:

```bash
# Проверка автообновления
sudo certbot renew --dry-run

# Ручное обновление (если нужно)
sudo certbot renew
```

## Troubleshooting

### Nginx не запускается

```bash
# Проверьте конфигурацию
sudo nginx -t

# Проверьте логи
sudo tail -f /var/log/nginx/error.log
```

### SSL сертификат не получен

```bash
# Получите вручную
sudo certbot --nginx -d api.amesin.ru -d app.amesin.ru

# Или для одного домена
sudo certbot --nginx -d amesin.ru
```

### Docker контейнеры не запускаются

```bash
# Проверьте логи
cd /opt/makemefit/infra
docker-compose logs

# Проверьте .env файл
cat ../backend/.env
```

## Структура после деплоя

```
/opt/makemefit/
├── backend/
│   ├── .env          # Секреты (не в git!)
│   └── ...
├── frontend/
│   └── ...
├── infra/
│   └── docker-compose.yml
└── scripts/
    └── cleanup_nginx.sh

/etc/nginx/
├── sites-available/
│   └── makemefit     # Создается при деплое
└── sites-enabled/
    └── makemefit -> ../sites-available/makemefit

/etc/letsencrypt/
└── live/
    └── amesin.ru/    # SSL сертификаты
```

## Быстрая команда для первого деплоя

```bash
# 1. Очистите Nginx на сервере
ssh deploy@amesin.ru 'cd /opt/makemefit && ./scripts/cleanup_nginx.sh'

# 2. Создайте .env на сервере
ssh deploy@amesin.ru 'cd /opt/makemefit/backend && nano .env'

# 3. Настройте DNS (если поддомены)
# api.amesin.ru → IP
# app.amesin.ru → IP

# 4. Push в main
git push origin main

# 5. Проверьте
curl https://api.amesin.ru/health
```

Готово! После первого деплоя все последующие обновления будут автоматическими.
