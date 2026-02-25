# MakeMeFit Telegram Mini App MVP

Production-ready MVP Telegram Mini App that provides AI-powered recommendations for two tracks:
- Supplements
- Workouts

## Быстрый старт

1. **Создайте .env файлы:**
   ```bash
   ./scripts/create-env.sh
   ```
   Или создайте вручную (см. `scripts/README-ENV.md`)

2. **Заполните обязательные значения в `backend/.env`:**
   - `TELEGRAM_BOT_TOKEN` - токен от @BotFather (обязательно! Mini App работает через бота)
   - `TELEGRAM_BOT_USERNAME` - username бота без @
   - `LLM_API_KEY` - API ключ для LLM
   - `LLM_BASE_URL` - URL endpoint (например, `https://foundation-models.api.cloud.ru/v1`)
   - `SECRET_KEY` - случайная строка минимум 32 символа (сгенерируйте: `openssl rand -hex 32`)
   - `PAYMENT_PROVIDER_TOKEN` - можно оставить пустым для теста
   
   📖 **Подробная инструкция**: [docs/TELEGRAM_SETUP.md](docs/TELEGRAM_SETUP.md)

3. **Запустите через Docker Compose:**
   ```bash
   cd infra
   docker-compose up -d
   ```

## Структура проекта

- `frontend/`: React + TypeScript Telegram Mini App
- `backend/`: FastAPI, async, Postgres, LLM abstraction, PDF generation
- `infra/`: Docker, docker-compose, Container Apps deployment helpers
- `docs/`: Документация (архитектура, деплой, настройка окружения)

## Важно про LLM провайдер

- **Название провайдера не играет роли** - система работает с любым OpenAI-совместимым API
- Если указан `LLM_BASE_URL`, система автоматически использует его
- Просто укажите ваш endpoint в `LLM_BASE_URL` и API ключ в `LLM_API_KEY`

## Документация

### Деплой (рекомендуется)
- [Автоматический деплой на VM](docs/AUTO_DEPLOY.md) - **автоматический деплой через GitHub Actions**
- [Деплой на VM с IP](docs/DEPLOY_VM.md) - ручное развертывание на сервере
- [Быстрый деплой](docs/QUICK_DEPLOY.md) - краткая инструкция

### Разработка
- [Локальное тестирование](docs/LOCAL_TESTING.md) - как протестировать локально

### Настройка
- [Настройка Python окружения](docs/SETUP_PYTHON.md) - venv, Poetry, зависимости (с Homebrew)
- [Настройка Python БЕЗ Homebrew](docs/SETUP_PYTHON_NO_BREW.md) - альтернативные способы установки
- [Настройка Telegram Mini App](docs/TELEGRAM_SETUP.md) - создание бота, настройка Mini App
- [Настройка окружения](docs/ENV_SETUP.md) - переменные окружения, локальный запуск
- [Создание .env файлов](scripts/README-ENV.md) - шаблоны и примеры

### Архитектура
- [Архитектура](docs/README.md)
