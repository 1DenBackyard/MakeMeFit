# Синхронизация кода и пересборка Frontend

## Проблема
На VM файл `App.tsx` содержит старый код, хотя в репозитории он обновлен.

## Решение

**Выполните на VM:**

```bash
# 1. Синхронизация кода из репозитория
cd /opt/makemefit
cp backend/.env /tmp/b.env
git fetch origin
git reset --hard origin/main
cp /tmp/b.env backend/.env
rm /tmp/b.env

# 2. Проверка, что код обновлен
head -15 frontend/src/ui/App.tsx
# Должны увидеть импорты компонентов, а НЕ "frontend shell"

# 3. Если код не обновлен, проверьте git статус
git status
git log -1

# 4. Полная пересборка frontend
cd infra
docker-compose down
docker rmi makemefit-frontend 2>/dev/null || true
docker-compose build --no-cache frontend
docker-compose up -d

# 5. Проверка логов
docker-compose logs frontend | tail -30
```

## Если git reset не помог

Возможно, изменения не закоммичены в репозиторий. Проверьте:

```bash
# На вашем локальном компьютере
cd /Users/amesin/MakeMeFit
git status
git add .
git commit -m "Update frontend UI"
git push origin main
```

Затем на VM:
```bash
cd /opt/makemefit
git pull origin main
cd infra
docker-compose build --no-cache frontend
docker-compose up -d
```

## Быстрая команда (все в одной):

```bash
cd /opt/makemefit && \
cp backend/.env /tmp/b.env && \
git fetch origin && \
git reset --hard origin/main && \
cp /tmp/b.env backend/.env && \
rm /tmp/b.env && \
head -15 frontend/src/ui/App.tsx && \
cd infra && \
docker-compose down && \
docker rmi makemefit-frontend 2>/dev/null || true && \
docker-compose build --no-cache frontend && \
docker-compose up -d
```

## Проверка результата

После выполнения:

1. Проверьте код:
   ```bash
   head -15 /opt/makemefit/frontend/src/ui/App.tsx
   ```
   Должны увидеть: `import { TrackSelection } from '../components/TrackSelection';`

2. Проверьте собранный JS:
   ```bash
   docker-compose exec frontend ls -la /usr/share/nginx/html/assets/
   ```

3. Очистите кэш Telegram и откройте Mini App заново
