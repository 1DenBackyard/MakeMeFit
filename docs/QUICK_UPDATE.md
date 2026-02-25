# Быстрое обновление на VM

## Одна команда для обновления

```bash
cd /opt/makemefit && ./scripts/update_vm.sh
```

Этот скрипт автоматически:
1. ✅ Сохраняет `.env` файлы
2. ✅ Обновляет код из git
3. ✅ Восстанавливает `.env` файлы
4. ✅ Пересобирает контейнеры без кэша
5. ✅ Перезапускает все сервисы

## Что делает скрипт

```bash
# Сохраняет секреты
cp backend/.env /tmp/backend.env.bak

# Обновляет код
git fetch origin
git reset --hard origin/main

# Восстанавливает секреты
cp /tmp/backend.env.bak backend/.env

# Пересобирает и перезапускает
cd infra
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Проверка после обновления

```bash
# Статус контейнеров
cd /opt/makemefit/infra
docker-compose ps

# Логи
docker-compose logs -f

# Health check
curl http://localhost:8000/health
```
