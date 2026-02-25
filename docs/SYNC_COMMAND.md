# Команда для синхронизации файлов на VM

## Быстрая команда

```bash
# На VM
ssh deploy@amesin.ru
cd /opt/makemefit && ./scripts/sync_from_repo.sh && cd infra && docker-compose up -d --build
```

## Что делает

1. Сохраняет существующие `.env` файлы
2. Обновляет код из git репозитория
3. Восстанавливает `.env` файлы
4. Перезапускает контейнеры

## Альтернатива: через git напрямую

```bash
# На VM
cd /opt/makemefit

# Сохраните .env
cp backend/.env /tmp/backend.env.bak 2>/dev/null || true

# Обновите код
git fetch origin
git reset --hard origin/main

# Восстановите .env
cp /tmp/backend.env.bak backend/.env 2>/dev/null || true
rm -f /tmp/backend.env.bak

# Перезапустите
cd infra
docker-compose up -d --build
```

## Проверка

```bash
curl http://localhost:8000/health
# или
curl https://api.amesin.ru/health
```

Подробнее: [SYNC_VM.md](SYNC_VM.md)
