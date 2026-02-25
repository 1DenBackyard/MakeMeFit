# Быстрая синхронизация файлов на VM

## Команда для синхронизации

```bash
# На VM
ssh deploy@amesin.ru
cd /opt/makemefit
./scripts/sync_from_repo.sh
```

## Что делает скрипт

1. ✅ Сохраняет `backend/.env` и `frontend/.env`
2. ✅ Обновляет код из git репозитория
3. ✅ Восстанавливает `.env` файлы
4. ✅ Не трогает ваши секреты

## После синхронизации

```bash
# Перезапустите контейнеры
cd infra
docker-compose up -d --build

# Проверьте
curl http://localhost:8000/health
```

## Альтернатива: через git напрямую

```bash
cd /opt/makemefit

# Сохраните .env
cp backend/.env /tmp/backend.env.bak

# Обновите код
git fetch origin
git reset --hard origin/main

# Восстановите .env
cp /tmp/backend.env.bak backend/.env
rm /tmp/backend.env.bak
```

Подробнее: [SYNC_VM.md](SYNC_VM.md)
