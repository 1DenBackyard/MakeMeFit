# Синхронизация файлов на VM из репозитория

## Автоматическая синхронизация (рекомендуется)

### Использование скрипта

```bash
# На VM
ssh deploy@amesin.ru
cd /opt/makemefit

# Запустите скрипт синхронизации
./scripts/sync_from_repo.sh
```

Скрипт автоматически:
- ✅ Сохраняет существующие `.env` файлы
- ✅ Обновляет код из репозитория
- ✅ Восстанавливает `.env` файлы
- ✅ Не трогает ваши секреты

### Настройка скрипта (опционально)

```bash
# Установите переменные окружения
export REPO_URL=https://github.com/your-username/MakeMeFit.git
export BRANCH=main

# Запустите
./scripts/sync_from_repo.sh
```

## Ручная синхронизация через git

### Вариант 1: С сохранением .env

```bash
# На VM
cd /opt/makemefit

# Сохраните .env файлы
cp backend/.env /tmp/backend.env.bak
cp frontend/.env /tmp/frontend.env.bak 2>/dev/null || true

# Обновите код
git fetch origin
git reset --hard origin/main

# Восстановите .env файлы
cp /tmp/backend.env.bak backend/.env
cp /tmp/frontend.env.bak frontend/.env 2>/dev/null || true

# Удалите временные файлы
rm /tmp/*.env.bak
```

### Вариант 2: Через git stash

```bash
cd /opt/makemefit

# Сохраните изменения (включая .env)
git stash push -m "Save .env files" backend/.env frontend/.env 2>/dev/null || true

# Обновите код
git fetch origin
git reset --hard origin/main

# Восстановите .env (если были в stash)
git stash pop 2>/dev/null || true
```

### Вариант 3: Через rsync (если нет git на VM)

```bash
# На вашем локальном компьютере
rsync -avz --delete \
  --exclude='.git' \
  --exclude='backend/.env' \
  --exclude='frontend/.env' \
  --exclude='venv' \
  --exclude='__pycache__' \
  --exclude='node_modules' \
  ./ deploy@amesin.ru:/opt/makemefit/
```

## После синхронизации

### 1. Перезапустите контейнеры

```bash
cd /opt/makemefit/infra
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 2. Примените миграции (если есть изменения в БД)

```bash
docker-compose exec backend alembic upgrade head
```

### 3. Проверьте health

```bash
curl http://localhost:8000/health
# или
curl https://api.amesin.ru/health
```

## Автоматическая синхронизация через GitHub Actions

Если настроен автоматический деплой (`.github/workflows/deploy.yml`), просто:

```bash
# На вашем компьютере
git push origin main
```

GitHub Actions автоматически:
- Обновит код на сервере
- Сохранит `.env` файлы
- Пересоберет и перезапустит контейнеры

## Защита .env файлов

### Убедитесь, что .env в .gitignore

```bash
# Проверьте
cat .gitignore | grep "\.env"

# Должно быть:
# .env
# .env.local
# .env.*.local
```

### Проверка перед коммитом

```bash
# Проверьте, что .env не в git
git status | grep "\.env"

# Если видите .env файлы, удалите их из индекса:
git rm --cached backend/.env frontend/.env
```

## Troubleshooting

### "Permission denied" при синхронизации

```bash
# Проверьте права
ls -la /opt/makemefit

# Исправьте права
sudo chown -R deploy:deploy /opt/makemefit
```

### ".env файл перезаписан"

```bash
# Восстановите из бэкапа (если скрипт создал)
ls -la /tmp/makemefit_env_backup_*

# Или восстановите вручную
nano backend/.env
```

### "Git repository not found"

```bash
# Клонируйте репозиторий
cd /opt
git clone https://github.com/your-username/MakeMeFit.git makemefit
cd makemefit
```

## Быстрая команда

```bash
# Одной командой на VM
cd /opt/makemefit && ./scripts/sync_from_repo.sh && cd infra && docker-compose up -d --build
```
