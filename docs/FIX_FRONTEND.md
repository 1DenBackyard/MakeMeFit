# Исправление проблемы с Frontend

Если вы видите старый текст "Telegram Mini App MVP – frontend shell" вместо нового UI, выполните следующие шаги:

## Шаг 1: Синхронизация кода на VM

**На VM выполните:**

```bash
cd /opt/makemefit
cp backend/.env /tmp/b.env
git fetch origin
git reset --hard origin/main
cp /tmp/b.env backend/.env
rm /tmp/b.env
```

## Шаг 2: Проверка файлов

Убедитесь, что файлы обновлены:

```bash
# Проверьте App.tsx
head -20 frontend/src/ui/App.tsx

# Должны увидеть импорты компонентов, а не старый текст
# Если видите "frontend shell" - код не синхронизирован
```

## Шаг 3: Полная пересборка Frontend

```bash
cd /opt/makemefit/infra

# Остановите контейнеры
docker-compose down

# Удалите старый образ frontend
docker rmi makemefit-frontend 2>/dev/null || true
docker rmi $(docker images | grep makemefit-frontend | awk '{print $3}') 2>/dev/null || true

# Очистите build кэш
docker builder prune -f

# Пересоберите БЕЗ кэша
docker-compose build --no-cache frontend

# Запустите
docker-compose up -d

# Проверьте логи
docker-compose logs frontend | tail -50
```

## Шаг 4: Очистка кэша Nginx

```bash
# Перезапустите Nginx
sudo systemctl reload nginx

# Или полный перезапуск
sudo systemctl restart nginx
```

## Шаг 5: Проверка в браузере

1. **Очистите кэш Telegram:**
   - Закройте Mini App полностью
   - Откройте заново
   - Или используйте другой аккаунт для теста

2. **Проверьте напрямую через браузер:**
   ```bash
   curl https://app.amesin.ru | head -50
   ```
   
   Должны увидеть HTML с React приложением, а не старый текст.

## Шаг 6: Если все еще не работает

### Проверьте, что сборка прошла успешно:

```bash
cd /opt/makemefit/infra
docker-compose exec frontend ls -la /usr/share/nginx/html
```

Должны увидеть файлы `index.html`, `assets/` и т.д.

### Проверьте содержимое index.html:

```bash
docker-compose exec frontend cat /usr/share/nginx/html/index.html
```

### Проверьте логи сборки:

```bash
docker-compose logs frontend | grep -i error
```

## Полная команда для быстрого исправления:

```bash
cd /opt/makemefit && \
cp backend/.env /tmp/b.env && \
git fetch origin && \
git reset --hard origin/main && \
cp /tmp/b.env backend/.env && \
rm /tmp/b.env && \
cd infra && \
docker-compose down && \
docker rmi makemefit-frontend 2>/dev/null || true && \
docker-compose build --no-cache frontend && \
docker-compose up -d && \
sudo systemctl reload nginx
```

## Проверка результата

После выполнения команд:

1. Подождите 30-60 секунд
2. Закройте Mini App в Telegram полностью
3. Откройте заново
4. Должен появиться новый UI с выбором трека (Supplements/Workouts)

## Если проблема сохраняется

Проверьте:
- Что код действительно обновлен: `git log -1` на VM
- Что нет ошибок сборки: `docker-compose logs frontend`
- Что Nginx правильно проксирует: `curl -I https://app.amesin.ru`
