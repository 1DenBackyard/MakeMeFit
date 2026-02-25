# Troubleshooting

## Проблемы с docker-compose

### "can't cd to infra"

**Проблема:** Вы не в корневой директории проекта

**Решение:**
```bash
# Убедитесь, что вы в корне проекта
cd /opt/MakeMeFit
# или
cd /path/to/MakeMeFit

# Затем перейдите в infra
cd infra
docker-compose up -d
```

### "env file not found: frontend/.env"

**Проблема:** Docker-compose ищет .env файл для frontend

**Решение:** 
Файл `frontend/.env` теперь опциональный. Если его нет, используется значение по умолчанию.

Создайте файл (опционально):
```bash
cd /opt/MakeMeFit/frontend
echo "VITE_API_URL=http://localhost:8000" > .env
```

Или используйте переменную окружения:
```bash
export VITE_API_URL=https://api.amesin.ru
cd infra
docker-compose up -d
```

### "version is obsolete"

**Проблема:** В docker-compose.yml указана версия (устарело в новых версиях)

**Решение:** Версия уже удалена из файла. Если видите предупреждение, обновите docker-compose:
```bash
# Обновите docker-compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Проблемы с запуском

### Backend не запускается

```bash
# Проверьте логи
cd /opt/MakeMeFit/infra
docker-compose logs backend

# Проверьте .env файл
cat ../backend/.env

# Проверьте, что все переменные заполнены
```

### Frontend не запускается

```bash
# Проверьте логи
docker-compose logs frontend

# Проверьте, что backend доступен
curl http://localhost:8000/health
```

### PostgreSQL не подключается

```bash
# Проверьте, что PostgreSQL запущен
docker-compose ps postgres

# Проверьте логи
docker-compose logs postgres

# Проверьте подключение
docker-compose exec postgres psql -U makemefit -d makemefit
```

## Проблемы с деплоем

### GitHub Actions не может подключиться

```bash
# Проверьте SSH ключ
cat ~/.ssh/makemefit_deploy

# Проверьте подключение вручную
ssh -i ~/.ssh/makemefit_deploy deploy@amesin.ru

# Проверьте, что ключ добавлен в GitHub Secrets
```

### Деплой падает на этапе сборки

```bash
# Проверьте логи GitHub Actions
# В репозитории: Actions → выберите workflow → посмотрите логи

# Или проверьте на сервере
ssh deploy@amesin.ru
cd /opt/makemefit/infra
docker-compose logs
```

### Nginx не работает после деплоя

```bash
# Проверьте конфигурацию
sudo nginx -t

# Проверьте логи
sudo tail -f /var/log/nginx/error.log

# Проверьте, что конфигурация создана
ls -la /etc/nginx/sites-available/makemefit
ls -la /etc/nginx/sites-enabled/makemefit
```

## Полезные команды

### Перезапуск всех сервисов

```bash
cd /opt/makemefit/infra
docker-compose restart
```

### Остановка всех сервисов

```bash
docker-compose down
```

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Пересборка образов

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Очистка всего

```bash
# Остановить и удалить контейнеры
docker-compose down

# Удалить volumes (⚠️ удалит данные БД!)
docker-compose down -v

# Удалить образы
docker-compose down --rmi all
```
