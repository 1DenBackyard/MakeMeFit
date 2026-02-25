# Настройка Telegram Mini App

## Почему нужен бот?

Telegram Mini Apps **всегда** работают через бота. Вот как это устроено:

1. **Бот создает Mini App** - вы создаете бота через @BotFather и настраиваете Mini App
2. **Пользователь открывает Mini App через бота** - пользователь нажимает кнопку в боте или переходит по ссылке
3. **Telegram передает initData** - когда пользователь открывает Mini App, Telegram передает данные через `initData`, которые содержат информацию о пользователе
4. **Backend валидирует initData** - ваш backend проверяет подпись `initData` используя токен бота

**Без бота Mini App не работает!**

## Пошаговая настройка

### 1. Создание бота

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Следуйте инструкциям:
   - Введите имя бота (например: "MakeMeFit Bot")
   - Введите username бота (например: `makemefit_bot`)
4. **Скопируйте токен** - BotFather выдаст вам токен вида `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

### 2. Настройка Mini App

1. В том же чате с @BotFather отправьте `/newapp`
2. Выберите вашего бота из списка
3. Введите название Mini App (например: "MakeMeFit")
4. Введите описание (например: "AI-powered fitness recommendations")
5. Загрузите иконку (опционально)
6. **Важно**: Укажите URL вашего фронтенда:
   - Для локального теста: `https://your-ngrok-url.ngrok.io` (см. ниже)
   - Для продакшена: `https://your-domain.com`

### 3. Получение данных для .env

После создания бота у вас будет:
- **TELEGRAM_BOT_TOKEN**: токен от BotFather (например: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)
- **TELEGRAM_BOT_USERNAME**: username бота без @ (например: `makemefit_bot`)

## Локальное тестирование Mini App

### Проблема
Telegram требует HTTPS для Mini Apps, но локально у вас HTTP.

### Решение: ngrok (или аналог)

1. **Установите ngrok:**
   ```bash
   # macOS
   brew install ngrok
   
   # или скачайте с https://ngrok.com
   ```

2. **Запустите фронтенд локально:**
   ```bash
   cd frontend
   npm run dev
   # Фронтенд запустится на http://localhost:5173
   ```

3. **Создайте туннель:**
   ```bash
   ngrok http 5173
   ```

4. **Скопируйте HTTPS URL** (например: `https://abc123.ngrok.io`)

5. **Обновите Mini App URL в BotFather:**
   - Отправьте `/myapps` в @BotFather
   - Выберите ваше приложение
   - Выберите "Edit" → "Web App URL"
   - Вставьте ваш ngrok URL

6. **Обновите `frontend/.env`:**
   ```env
   VITE_API_URL=https://your-ngrok-backend.ngrok.io
   ```

7. **Создайте туннель для бэкенда:**
   ```bash
   # В другом терминале
   ngrok http 8000
   ```

## Заполнение .env для теста (без платежей)

### Backend (.env)

```env
# App
APP_NAME=MakeMeFit API
APP_VERSION=0.1.0
DEBUG=true

# Database
DATABASE_URL=postgresql+asyncpg://makemefit:makemefit@localhost:5432/makemefit

# Telegram (ОБЯЗАТЕЛЬНО)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz  # От @BotFather
TELEGRAM_BOT_USERNAME=makemefit_bot  # Без @

# LLM Provider
LLM_PROVIDER=openai
LLM_API_KEY=your_api_key_here
LLM_BASE_URL=https://foundation-models.api.cloud.ru/v1  # Ваш endpoint
LLM_MODEL=openai/gpt-oss-120b
LLM_MODEL_FULL=openai/gpt-oss-120b
LLM_STREAMING=true

# Payments (можно оставить пустым для теста)
PAYMENT_PROVIDER_TOKEN=

# Security (ОБЯЗАТЕЛЬНО)
SECRET_KEY=your_random_secret_key_min_32_characters_long_12345  # Сгенерируйте случайную строку

# Admin (опционально)
ADMIN_SECRET=

# PDF Storage
PDF_STORAGE_PATH=/tmp/pdfs
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
# Или для теста через ngrok:
# VITE_API_URL=https://your-ngrok-backend.ngrok.io
```

## Генерация SECRET_KEY

Для безопасности нужна случайная строка минимум 32 символа:

```bash
# Linux/macOS
openssl rand -hex 32

# Или Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Или онлайн генератор
# https://randomkeygen.com/
```

## Что можно оставить пустым для теста

- ✅ `PAYMENT_PROVIDER_TOKEN` - можно оставить пустым, платежи не будут работать
- ✅ `ADMIN_SECRET` - можно оставить пустым, админ панель не будет доступна

## Что ОБЯЗАТЕЛЬНО заполнить

- ❌ `TELEGRAM_BOT_TOKEN` - **обязательно**, без него Mini App не работает
- ❌ `TELEGRAM_BOT_USERNAME` - **обязательно**, без него валидация не работает
- ❌ `LLM_API_KEY` - **обязательно**, без него AI не работает
- ❌ `LLM_BASE_URL` - **обязательно**, если используете кастомный endpoint
- ❌ `SECRET_KEY` - **обязательно**, для безопасности JWT токенов

## Проверка настройки

1. Запустите бэкенд:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. Проверьте health check:
   ```bash
   curl http://localhost:8000/health
   # Должен вернуть: {"status":"ok","version":"0.1.0"}
   ```

3. Откройте бота в Telegram и нажмите на кнопку Mini App

4. Если видите ошибку - проверьте:
   - Токен бота правильный
   - URL фронтенда правильный (через ngrok для локального теста)
   - Бэкенд запущен и доступен

## Частые проблемы

### "Invalid Telegram initData"
- Проверьте `TELEGRAM_BOT_TOKEN` - должен совпадать с токеном бота
- Проверьте, что используете правильного бота

### "Mini App не открывается"
- Проверьте URL в настройках Mini App в BotFather
- URL должен быть HTTPS (используйте ngrok для локального теста)
- URL должен быть доступен из интернета

### "CORS error"
- Убедитесь, что фронтенд и бэкенд на правильных портах
- Проверьте `VITE_API_URL` в frontend/.env
