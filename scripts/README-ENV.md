# Создание .env файлов

## Быстрый способ

Запустите скрипт:
```bash
./scripts/create-env.sh
```

## Ручное создание

### Backend (.env в `backend/`)

Создайте файл `backend/.env` со следующим содержимым:

```env
# App
APP_NAME=MakeMeFit API
APP_VERSION=0.1.0
DEBUG=false

# Database
DATABASE_URL=postgresql+asyncpg://makemefit:makemefit@localhost:5432/makemefit

# Telegram (ОБЯЗАТЕЛЬНО для Mini App!)
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=

# LLM Provider (OpenAI-compatible)
LLM_PROVIDER=openai
LLM_API_KEY=
LLM_BASE_URL=
LLM_MODEL=gpt-4o-mini
LLM_MODEL_FULL=gpt-4o
LLM_STREAMING=true

# Payments (можно оставить пустым для теста)
PAYMENT_PROVIDER_TOKEN=

# Security (ОБЯЗАТЕЛЬНО!)
SECRET_KEY=
RATE_LIMIT_PER_MINUTE=10

# Admin (опционально)
ADMIN_SECRET=

# PDF Storage
PDF_STORAGE_PATH=/tmp/pdfs
```

### Frontend (.env в `frontend/`)

Создайте файл `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

## Заполнение значений

### 🔴 ОБЯЗАТЕЛЬНЫЕ поля для backend/.env:

1. **TELEGRAM_BOT_TOKEN** 
   - Получите от [@BotFather](https://t.me/BotFather)
   - Команда: `/newbot` → следуйте инструкциям
   - Формат: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

2. **TELEGRAM_BOT_USERNAME**
   - Username вашего бота (без @)
   - Например: `makemefit_bot`

3. **LLM_API_KEY**
   - API ключ для вашего LLM провайдера

4. **LLM_BASE_URL**
   - URL вашего OpenAI-совместимого endpoint
   - Например: `https://foundation-models.api.cloud.ru/v1`
   - Если используете стандартный OpenAI, можно оставить пустым

5. **SECRET_KEY**
   - Случайная строка минимум 32 символа
   - Для генерации: `openssl rand -hex 32`
   - Или: `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`

### 🟡 ОПЦИОНАЛЬНЫЕ поля:

- **PAYMENT_PROVIDER_TOKEN** - можно оставить пустым для теста
- **ADMIN_SECRET** - можно оставить пустым

## Почему нужен бот для Mini App?

**Telegram Mini Apps всегда работают через бота!**

1. Бот создается через @BotFather
2. Mini App настраивается в том же боте
3. Пользователь открывает Mini App через кнопку в боте
4. Backend валидирует данные пользователя используя токен бота

**Без бота Mini App не работает!**

Подробная инструкция: [docs/TELEGRAM_SETUP.md](../docs/TELEGRAM_SETUP.md)

## Важно про LLM

- **Название провайдера (LLM_PROVIDER) не играет роли**
- Если указан `LLM_BASE_URL`, система автоматически использует его
- Работает с любым OpenAI-совместимым API

## Пример заполненного .env для теста

```env
# App
APP_NAME=MakeMeFit API
APP_VERSION=0.1.0
DEBUG=true

# Database
DATABASE_URL=postgresql+asyncpg://makemefit:makemefit@localhost:5432/makemefit

# Telegram
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=makemefit_bot

# LLM Provider
LLM_PROVIDER=openai
LLM_API_KEY=sk-your-api-key-here
LLM_BASE_URL=https://foundation-models.api.cloud.ru/v1
LLM_MODEL=openai/gpt-oss-120b
LLM_MODEL_FULL=openai/gpt-oss-120b
LLM_STREAMING=true

# Payments (пусто для теста)
PAYMENT_PROVIDER_TOKEN=

# Security
SECRET_KEY=your_generated_secret_key_32_chars_minimum_here
RATE_LIMIT_PER_MINUTE=10

# Admin (пусто для теста)
ADMIN_SECRET=

# PDF Storage
PDF_STORAGE_PATH=/tmp/pdfs
```
