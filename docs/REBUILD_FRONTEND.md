# Пересборка Frontend после изменений

Если вы видите старый текст "Telegram Mini App MVP – frontend shell" вместо нового UI, нужно пересобрать frontend контейнер.

## На VM выполните:

```bash
# 1. Остановите контейнеры
cd /opt/makemefit/infra
docker-compose down

# 2. Пересоберите frontend (без кэша)
docker-compose build --no-cache frontend

# 3. Запустите контейнеры
docker-compose up -d

# 4. Проверьте логи
docker-compose logs frontend
```

## Или одной командой:

```bash
cd /opt/makemefit/infra && docker-compose down && docker-compose build --no-cache frontend && docker-compose up -d
```

## Проверка

После пересборки откройте приложение в Telegram и проверьте, что видите новый UI с выбором трека (Supplements/Workouts).

## Если все еще видите старый код

1. **Очистите кэш браузера/Telegram:**
   - Закройте и откройте Mini App заново
   - Или используйте инкогнито режим

2. **Проверьте, что код обновлен на VM:**
   ```bash
   cd /opt/makemefit
   git status
   git log -1
   ```

3. **Убедитесь, что файлы на месте:**
   ```bash
   ls -la frontend/src/ui/App.tsx
   ls -la frontend/src/styles/theme.ts
   ```

4. **Принудительно пересоберите:**
   ```bash
   cd /opt/makemefit/infra
   docker-compose rm -f frontend
   docker-compose build --no-cache frontend
   docker-compose up -d
   ```
