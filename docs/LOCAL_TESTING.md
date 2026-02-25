# Локальное тестирование

## Быстрый старт

### 1. Запустите Backend

```bash
cd backend
source venv/bin/activate  # если используете venv
uvicorn app.main:app --reload
```

Сервер запустится на `http://127.0.0.1:8000`

### 2. Проверьте Health Check

```bash
curl http://localhost:8000/health
```

Должен вернуть:
```json
{"status":"ok","version":"0.1.0"}
```

### 3. Проверьте API документацию

Откройте в браузере:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Тестирование API endpoints

### Health Check

```bash
curl http://localhost:8000/health
```

### Авторизация (требует Telegram initData)

```bash
# Для теста нужен валидный initData от Telegram
# В реальном Mini App это передается автоматически
curl -X POST http://localhost:8000/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"init_data": "your_telegram_init_data_here"}'
```

## Тестирование Mini App локально

### Проблема
Telegram требует HTTPS для Mini Apps, но локально у вас HTTP.

### Решение: ngrok (или аналог)

#### 1. Установите ngrok

**⚠️ Если получаете SSL ошибку, см. [NGROK_SSL_FIX.md](NGROK_SSL_FIX.md)**

**Вариант A: Скачать бинарник вручную (рекомендуется, избегает SSL проблем):**
```bash
# macOS Apple Silicon
cd ~/Downloads
curl -L -o ngrok.zip https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-arm64.zip
unzip ngrok.zip
mkdir -p ~/bin
mv ngrok ~/bin/
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Теперь используйте
ngrok http 8000
```

**Вариант B: Через Python (может быть SSL проблема):**
```bash
cd backend
source venv/bin/activate
pip install pyngrok

# Используйте скрипт
python ../scripts/start_ngrok.py 8000
```

**Подробнее:** 
- [NGROK_SETUP.md](NGROK_SETUP.md) - общая инструкция
- [NGROK_SSL_FIX.md](NGROK_SSL_FIX.md) - исправление SSL ошибок

#### 2. Запустите Backend

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Создайте туннель для Backend

```bash
# В другом терминале
ngrok http 8000
```

Скопируйте HTTPS URL (например: `https://abc123.ngrok.io`)

#### 4. Запустите Frontend

```bash
cd frontend
npm run dev
# Фронтенд запустится на http://localhost:5173
```

#### 5. Создайте туннель для Frontend

```bash
# В третьем терминале
ngrok http 5173
```

Скопируйте HTTPS URL (например: `https://xyz789.ngrok.io`)

#### 6. Обновите настройки

**Backend .env:**
```env
# Уже настроено, ничего менять не нужно
```

**Frontend .env:**
```env
VITE_API_URL=https://abc123.ngrok.io
```

**Перезапустите frontend:**
```bash
cd frontend
npm run dev
```

#### 7. Настройте Mini App в BotFather

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/myapps`
3. Выберите ваше приложение
4. Выберите "Edit" → "Web App URL"
5. Вставьте URL фронтенда: `https://xyz789.ngrok.io`

#### 8. Протестируйте

1. Откройте вашего бота в Telegram
2. Нажмите на кнопку Mini App
3. Должно открыться ваше приложение

## Тестирование без Telegram (для разработки)

### Мок авторизации

Создайте тестовый endpoint для разработки:

```python
# backend/app/routers/test_auth.py (только для разработки!)
from fastapi import APIRouter
from app.auth import create_jwt_token
from app.models import User
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

router = APIRouter(prefix="/test", tags=["test"])

@router.post("/auth/mock")
async def mock_auth(
    telegram_id: int = 123456789,
    db: AsyncSession = Depends(get_db)
):
    """Мок авторизации для тестирования (только для разработки!)"""
    # Создайте или получите пользователя
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(telegram_id=telegram_id, username="test_user")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    token = create_jwt_token(telegram_id)
    return {"token": token, "user": {"id": user.id, "telegram_id": user.telegram_id}}
```

**Важно:** Удалите этот endpoint перед продакшеном!

## Тестирование с базой данных

### 1. Запустите PostgreSQL

**Через Docker:**
```bash
docker run -d \
  --name makemefit-postgres \
  -e POSTGRES_USER=makemefit \
  -e POSTGRES_PASSWORD=makemefit \
  -e POSTGRES_DB=makemefit \
  -p 5432:5432 \
  postgres:15
```

**Или через docker-compose:**
```bash
cd infra
docker-compose up -d postgres
```

### 2. Настройте миграции

```bash
cd backend
source venv/bin/activate

# Создайте миграции
alembic revision --autogenerate -m "Initial migration"

# Примените миграции
alembic upgrade head

# Заполните тестовыми данными
python scripts/seed.py
```

### 3. Проверьте подключение

```bash
# Проверьте, что БД доступна
psql -h localhost -U makemefit -d makemefit
# Пароль: makemefit
```

## Тестирование LLM интеграции

### Проверьте конфигурацию

```bash
# Убедитесь, что в .env заполнены:
# LLM_API_KEY=your_key
# LLM_BASE_URL=your_endpoint
```

### Тестовый запрос

```bash
# Сначала получите токен (через /auth/telegram или /test/auth/mock)
TOKEN="your_jwt_token"

# Создайте запрос
curl -X POST http://localhost:8000/requests/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "track": "supplements",
    "form_data": {
      "goal": "Build muscle and improve recovery",
      "age": 30,
      "weight": 75,
      "activity_level": "active"
    }
  }'
```

## Полезные команды для тестирования

### Просмотр логов

```bash
# Backend логи в реальном времени
tail -f backend/logs/app.log  # если настроено логирование

# Или смотрите вывод uvicorn в терминале
```

### Проверка переменных окружения

```bash
cd backend
source venv/bin/activate
python -c "from app.config import settings; print(settings.database_url)"
```

### Тестирование конкретного endpoint

```bash
# Health check
curl http://localhost:8000/health

# API docs
open http://localhost:8000/docs
```

## Troubleshooting

### "Connection refused"

**Проблема:** Сервер не запущен или на другом порту

**Решение:**
```bash
# Проверьте, запущен ли сервер
lsof -i :8000

# Или запустите заново
cd backend
uvicorn app.main:app --reload
```

### "Database connection error"

**Проблема:** PostgreSQL не запущен или неправильный DATABASE_URL

**Решение:**
```bash
# Проверьте, запущен ли PostgreSQL
docker ps | grep postgres

# Или запустите
docker run -d --name makemefit-postgres \
  -e POSTGRES_USER=makemefit \
  -e POSTGRES_PASSWORD=makemefit \
  -e POSTGRES_DB=makemefit \
  -p 5432:5432 \
  postgres:15
```

### "Invalid Telegram initData"

**Проблема:** Неправильный токен бота или initData

**Решение:**
- Проверьте `TELEGRAM_BOT_TOKEN` в `.env`
- Убедитесь, что используете правильный initData от Telegram
- Для теста используйте мок авторизацию

### "Module not found"

**Проблема:** Зависимости не установлены

**Решение:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

## Следующие шаги

После локального тестирования:
- [Деплой на VM](DEPLOY_VM.md)
- [Настройка для продакшена](ENV_SETUP.md)
