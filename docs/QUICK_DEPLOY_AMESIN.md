# Быстрый деплой на amesin.ru

## Шаг 1: Очистка VM (один раз)

```bash
# Подключитесь к серверу
ssh deploy@amesin.ru

# Запустите скрипт очистки
cd /opt/makemefit
./scripts/cleanup_nginx.sh
```

Или вручную:
```bash
sudo systemctl stop nginx
sudo rm -f /etc/nginx/sites-enabled/*
sudo rm -f /etc/nginx/sites-available/makemefit
sudo systemctl start nginx
```

## Шаг 2: Настройка DNS

Настройте A записи в DNS:

```
api.amesin.ru → ваш-ip-адрес
app.amesin.ru → ваш-ip-адрес
```

Проверьте:
```bash
dig api.amesin.ru
dig app.amesin.ru
```

## Шаг 3: Настройка GitHub Secrets

В репозитории: **Settings → Secrets and variables → Actions**

Добавьте:
- `DEPLOY_HOST` = `amesin.ru` (или IP)
- `DEPLOY_USER` = `deploy`
- `DEPLOY_SSH_KEY` = приватный SSH ключ
- `DOMAIN_API` = `api.amesin.ru` (опционально)
- `DOMAIN_APP` = `app.amesin.ru` (опционально)

## Шаг 4: Создание .env на сервере

```bash
ssh deploy@amesin.ru
cd /opt/makemefit/backend
nano .env
```

Заполните все значения (см. `scripts/README-ENV.md`)

## Шаг 5: Первый деплой

```bash
# Push в main
git push origin main
```

GitHub Actions автоматически:
- ✅ Обновит код
- ✅ Соберет Docker образы
- ✅ Запустит контейнеры
- ✅ Настроит Nginx
- ✅ Получит SSL сертификаты
- ✅ Применит миграции

## Шаг 6: Проверка

```bash
# Health check
curl https://api.amesin.ru/health

# Должен вернуть: {"status":"ok","version":"0.1.0"}
```

## Что дальше?

Все последующие изменения автоматически деплоятся при push в main! 🚀

## Troubleshooting

### Ошибка "env file not found"
```bash
ssh deploy@amesin.ru
cd /opt/makemefit/backend
nano .env  # создайте файл
```

### Ошибка SSL сертификата
```bash
# Получите вручную
ssh deploy@amesin.ru
sudo certbot --nginx -d api.amesin.ru -d app.amesin.ru
```

### Проверка логов
```bash
ssh deploy@amesin.ru
cd /opt/makemefit/infra
docker-compose logs -f
```
